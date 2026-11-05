// ==== HINT START ====
// Intel brief: from what is known for certain, find the simplest next deduction and say it plainly.
// st: Uint8Array of N*N, 0 unknown, 1 mine, 2 clear. Returns {kind,text,focus:[cells],mines:[cells],clears:[cells]} or null.
function nextHint(reg,N,st,secName){
  const NN=N*N,L='ABCDEFGHIJ',nm=i=>L[i%N]+(((i/N)|0)+1),cap=s=>s[0].toUpperCase()+s.slice(1);
  const units=[];
  for(let r=0;r<N;r++){const u=[];for(let c=0;c<N;c++)u.push(r*N+c);units.push({t:'r',k:r,cells:u,name:`row ${r+1}`});}
  for(let c=0;c<N;c++){const u=[];for(let r=0;r<N;r++)u.push(r*N+c);units.push({t:'c',k:c,cells:u,name:`column ${L[c]}`});}
  for(let g=0;g<N;g++){const u=[];for(let i=0;i<NN;i++)if(reg[i]===g)u.push(i);units.push({t:'g',k:g,cells:u,name:secName(g)});}
  const attack=[];
  for(let i=0;i<NN;i++){const r=(i/N)|0,c=i%N,a=[];
    for(let j=0;j<NN;j++){if(j===i)continue;const r2=(j/N)|0,c2=j%N;
      if(r2===r||c2===c||reg[j]===reg[i]||(Math.abs(r2-r)<=1&&Math.abs(c2-c)<=1))a.push(j);}attack.push(a);}
  const cands=(s,u)=>{const o=[];for(const i of u.cells){if(s[i]===1)return null;if(s[i]===0)o.push(i);}return o;};
  const list=a=>a.length<=3?a.map(nm).join(', '):`${a.length} squares`;
  // 0: squares ruled out by a confirmed mine
  for(let i=0;i<NN;i++){if(st[i]!==1)continue;const open=attack[i].filter(j=>st[j]===0);
    if(open.length)return{kind:'Confirmed mine',short:`squares around the mine at ${nm(i)} are clear`,text:`${nm(i)} is a confirmed mine. Nothing else can sit in its row, column or sector, or touch it, so ${list(open)} ${open.length===1?'is':'are'} clear.`,focus:[i],mines:[],clears:open};}
  // 1: last spot
  for(const u of units){const c=cands(st,u);if(c&&c.length===1)return{kind:'Last spot',short:`last spot for ${u.name}: ${nm(c[0])} is mined`,text:`There's only one square left where the mine for ${u.name} can go: ${nm(c[0])}.`,focus:u.cells,mines:[c[0]],clears:[]};}
  // 2: boxed in
  for(const u of units){const c=cands(st,u);if(!c||c.length<2)continue;
    const ways=u.t==='g'?[['r',i=>(i/N)|0,k=>`row ${k+1}`],['c',i=>i%N,k=>`column ${L[k]}`]]:[['g',i=>reg[i],k=>secName(k)]];
    for(const[tt,f,label]of ways){const k=f(c[0]);if(!c.every(i=>f(i)===k))continue;
      const other=units.find(v=>v.t===tt&&v.k===k),cl=other.cells.filter(j=>st[j]===0&&!u.cells.includes(j));
      if(cl.length)return{kind:'Boxed in',short:`${u.name} is boxed into ${label(k)}`,text:`The mine for ${u.name} has to be in ${label(k)}. That's the one mine for ${label(k)}, so the rest of it is clear: ${list(cl)}.`,focus:u.cells,mines:[],clears:cl};}}
  // 3: blast check
  for(let i=0;i<NN;i++){if(st[i]!==0)continue;const a=new Set(attack[i]);
    for(const u of units){if(u.cells.includes(i))continue;const c=cands(st,u);if(!c||!c.length)continue;
      if(c.every(j=>a.has(j)))return{kind:'Blast check',short:`a mine at ${nm(i)} would leave ${u.name} empty`,text:`A mine at ${nm(i)} would rule out every square left for ${u.name}. So ${nm(i)} is clear.`,focus:u.cells.concat([i]),mines:[],clears:[i]};}}
  // 4: pairs and trios
  const combos=(arr,k)=>{const out=[];const rec=(s,acc)=>{if(acc.length===k){out.push(acc.slice());return;}for(let x=s;x<arr.length;x++){acc.push(arr[x]);rec(x+1,acc);acc.pop();}};rec(0,[]);return out;};
  const pairs=[['g','r',i=>(i/N)|0,'sectors','rows'],['g','c',i=>i%N,'sectors','columns'],['r','g',i=>reg[i],'rows','sectors'],['c','g',i=>reg[i],'columns','sectors']];
  for(const[from,to,f,fromW,toW]of pairs){
    const open=units.filter(u=>u.t===from).map(u=>({u,c:cands(st,u)})).filter(x=>x.c&&x.c.length);
    for(const k of[2,3]){if(open.length<=k)continue;
      for(const set of combos(open,k)){const keys=new Set();set.forEach(x=>x.c.forEach(i=>keys.add(f(i))));if(keys.size!==k)continue;
        const inside=new Set();set.forEach(x=>x.u.cells.forEach(i=>inside.add(i)));const cl=[],tos=[];
        for(const key of keys){const tu=units.find(v=>v.t===to&&v.k===key);tos.push(tu.name);for(const j of tu.cells)if(st[j]===0&&!inside.has(j))cl.push(j);}
        if(cl.length)return{kind:k===2?'Pair':'Trio',short:`${k} ${fromW} share ${k===2?'two':'three'} ${toW}`,text:cap(`${set.map(x=>x.u.name).join(k===2?' and ':', ').replace(/, ([^,]*)$/,' and $1')} ${k===2?'both':'all'} have to put their mines in ${tos.join(k===2?' or ':', ').replace(/, ([^,]*)$/,' or $1')}. That uses up ${k===2?'both':'all three'} of the mines for those ${toW}, so ${list(cl)} ${cl.length===1?'is':'are'} clear.`),focus:[].concat(...set.map(x=>x.u.cells)),mines:[],clears:cl};}}}
  // 5: what-if
  const place=(s,i)=>{if(s[i]===2)return false;s[i]=1;for(const j of attack[i]){if(s[j]===1)return false;s[j]=2;}return true;};
  const easy=s=>{for(let g=0;g<300;g++){let moved=false;
      for(const u of units){const c=cands(s,u);if(!c)continue;if(c.length===0)return u;if(c.length===1){if(!place(s,c[0]))return u;moved=true;break;}}
      if(!moved)return null;}return null;};
  for(let i=0;i<NN;i++){if(st[i]!==0)continue;const s2=st.slice();let bad=place(s2,i)?easy(s2):units[0];
    if(!bad)for(const u of units){const c=cands(s2,u);if(c&&c.length===0){bad=u;break;}}
    if(bad)return{kind:'What-if',short:`a mine at ${nm(i)} would leave ${bad.name} empty`,text:`Suppose ${nm(i)} were a mine. Follow the forced squares and ${bad.name} is left with nowhere for its mine. So ${nm(i)} is clear.`,focus:[i].concat(bad.cells),mines:[],clears:[i]};}
  return null;
}
// ==== HINT END ====
if(typeof module!=='undefined')module.exports={nextHint};
