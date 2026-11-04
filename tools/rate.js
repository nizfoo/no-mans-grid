// ==== RATER START ====
// Human-style solver. Grades a board by the hardest deduction it needs.
// 1 Last spot      : a row, column or sector has one square left
// 2 Boxed in       : a sector's squares all sit in one row/column (or a row's in one sector), so the rest of that line/sector is clear
// 3 Blast check    : a square is clear because a mine there would wipe out every option for some row, column or sector
// 4 Pairs & trios  : 2 or 3 sectors squeezed into the same 2 or 3 rows/columns (or the reverse)
// 5 What-if        : assume a mine, follow the easy logic, hit a contradiction
// 6 Beyond         : needs deeper guessing
function rateBoard(reg,N){
  const NN=N*N,units=[];
  for(let r=0;r<N;r++){const u=[];for(let c=0;c<N;c++)u.push(r*N+c);units.push({t:'r',k:r,cells:u});}
  for(let c=0;c<N;c++){const u=[];for(let r=0;r<N;r++)u.push(r*N+c);units.push({t:'c',k:c,cells:u});}
  for(let g=0;g<N;g++){const u=[];for(let i=0;i<NN;i++)if(reg[i]===g)u.push(i);units.push({t:'g',k:g,cells:u});}
  const attack=[];
  for(let i=0;i<NN;i++){const r=(i/N)|0,c=i%N,s=new Set();
    for(let j=0;j<NN;j++){if(j===i)continue;const r2=(j/N)|0,c2=j%N;
      if(r2===r||c2===c||reg[j]===reg[i]||(Math.abs(r2-r)<=1&&Math.abs(c2-c)<=1))s.add(j);}
    attack.push([...s]);}
  const rowsOf=i=>(i/N)|0,colsOf=i=>i%N;
  function place(st,i){ // returns false on contradiction
    if(st[i]===2)return false;if(st[i]===1)return true;st[i]=1;
    for(const j of attack[i]){if(st[j]===1)return false;st[j]=2;}return true;}
  function clear(st,i){if(st[i]===1)return false;st[i]=2;return true;}
  function cands(st,u){const out=[];for(const i of u.cells){if(st[i]===1)return null;if(st[i]===0)out.push(i);}return out;}
  function broken(st){for(const u of units){const c=cands(st,u);if(c&&c.length===0)return true;}return false;}
  function solved(st){let m=0;for(let i=0;i<NN;i++)if(st[i]===1)m++;return m===N;}
  // each technique returns true if it changed something (and keeps state consistent), or 'x' on contradiction
  function t1(st){for(const u of units){const c=cands(st,u);if(!c)continue;if(c.length===0)return'x';if(c.length===1){return place(st,c[0])?true:'x';}}return false;}
  function t2(st){
    for(const u of units){const c=cands(st,u);if(!c||c.length<2)continue;
      const lines=u.t==='g'?[['r',rowsOf],['c',colsOf]]:[['g',i=>reg[i]]];
      for(const[tt,f]of lines){const k=f(c[0]);if(!c.every(i=>f(i)===k))continue;
        const other=units.find(v=>v.t===tt&&v.k===k);let ch=false;
        for(const j of other.cells)if(st[j]===0&&!u.cells.includes(j)){st[j]=2;ch=true;}
        if(ch)return true;}}
    return false;}
  function t3(st){
    for(let i=0;i<NN;i++){if(st[i]!==0)continue;const a=new Set(attack[i]);
      for(const u of units){if(u.cells.includes(i))continue;const c=cands(st,u);if(!c)continue;
        if(c.every(j=>a.has(j))){st[i]=2;return true;}}}
    return false;}
  function combos(arr,k){const out=[];const rec=(s,acc)=>{if(acc.length===k){out.push(acc.slice());return;}for(let x=s;x<arr.length;x++){acc.push(arr[x]);rec(x+1,acc);acc.pop();}};rec(0,[]);return out;}
  function t4(st){
    const pairs=[['g','r',rowsOf],['g','c',colsOf],['r','g',i=>reg[i]],['c','g',i=>reg[i]]];
    for(const[from,to,f]of pairs){
      const open=units.filter(u=>u.t===from).map(u=>({u,c:cands(st,u)})).filter(x=>x.c&&x.c.length);
      for(const k of[2,3]){if(open.length<=k)continue;
        for(const set of combos(open,k)){const keys=new Set();set.forEach(x=>x.c.forEach(i=>keys.add(f(i))));
          if(keys.size!==k)continue;const inside=new Set();set.forEach(x=>x.u.cells.forEach(i=>inside.add(i)));let ch=false;
          for(const key of keys){const tu=units.find(v=>v.t===to&&v.k===key);for(const j of tu.cells)if(st[j]===0&&!inside.has(j)){st[j]=2;ch=true;}}
          if(ch)return true;}}}
    return false;}
  const TECH=[t1,t2,t3,t4];
  function propagate(st,maxLevel){ // run techniques up to maxLevel to a fixpoint; returns 'x' on contradiction
    for(let guard=0;guard<500;guard++){let moved=false;
      for(let L=0;L<maxLevel;L++){const r=TECH[L](st);if(r==='x')return'x';if(r){moved=true;break;}}
      if(broken(st))return'x';if(!moved)return'ok';}
    return'ok';}
  function t5(st){
    for(let i=0;i<NN;i++){if(st[i]!==0)continue;const s2=st.slice();
      if(!place(s2,i)||propagate(s2,3)==='x'){st[i]=2;return true;}}
    return false;}
  const ALL=[t1,t2,t3,t4,t5];
  const st=new Uint8Array(NN);const used=[0,0,0,0,0,0,0];let hardest=0,steps=0;
  for(let guard=0;guard<2000;guard++){
    if(solved(st))break;let moved=false;
    for(let L=0;L<ALL.length;L++){const r=ALL[L](st);if(r==='x')return{level:6,used,steps};
      if(r){used[L+1]++;hardest=Math.max(hardest,L+1);moved=true;steps++;break;}}
    if(!moved)return{level:6,used,steps};}
  return{level:hardest,used,steps};
}
// one number for ordering: hardest technique dominates, how often the harder ones were needed breaks ties
function scoreOf(r){return r.level*100+r.used[3]*4+r.used[4]*10+r.used[5]*25+r.used[2];}
// ==== RATER END ====
if(typeof module!=='undefined')module.exports={rateBoard,scoreOf};
