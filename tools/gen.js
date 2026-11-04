// ==== GENERATOR START ====
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function shuffle(arr,rng){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function randomSol(N,rng){
  const sol=new Array(N).fill(-1),used=new Array(N).fill(false);
  function rec(r){
    if(r===N)return true;
    const cols=shuffle([...Array(N).keys()],rng);
    for(const c of cols){
      if(used[c])continue;
      if(r>0&&Math.abs(c-sol[r-1])<2)continue;
      used[c]=true;sol[r]=c;
      if(rec(r+1))return true;
      used[c]=false;
    }
    return false;
  }
  rec(0);return sol;
}
function growRegions(N,sol,rng){
  const reg=new Array(N*N).fill(-1);const front=[];
  const push=(r,c,g)=>{for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<N&&cc>=0&&cc<N&&reg[rr*N+cc]<0)front.push([rr,cc,g]);}};
  for(let r=0;r<N;r++){reg[r*N+sol[r]]=r;push(r,sol[r],r);}
  let left=N*N-N;
  while(left>0){
    const i=Math.floor(rng()*front.length);const[r,c,g]=front[i];
    front[i]=front[front.length-1];front.pop();
    if(reg[r*N+c]>=0)continue;
    reg[r*N+c]=g;left--;push(r,c,g);
  }
  return reg;
}
function countSolutions(reg,N,cap){
  const maxRow=new Array(N).fill(0);
  for(let i=0;i<N*N;i++){const r=(i/N)|0;if(r>maxRow[reg[i]])maxRow[reg[i]]=r;}
  const dead=new Array(N+1).fill(0);
  for(let r=0;r<=N;r++)for(let g=0;g<N;g++)if(maxRow[g]<r)dead[r]|=1<<g;
  let n=0;
  function dfs(r,cm,gm,prev){
    if(r===N){n++;return;}
    if(dead[r]&~gm)return;
    for(let c=0;c<N;c++){
      if(cm&(1<<c))continue;
      if(prev>=0&&(c-prev<2&&prev-c<2))continue;
      const g=reg[r*N+c];
      if(gm&(1<<g))continue;
      dfs(r+1,cm|(1<<c),gm|(1<<g),c);
      if(n>=cap)return;
    }
  }
  dfs(0,0,0,-99);return n;
}
function regionConnectedWithout(reg,N,g,skip){
  let start=-1,size=0;
  for(let i=0;i<N*N;i++)if(reg[i]===g&&i!==skip){size++;if(start<0)start=i;}
  if(size===0)return false;
  const seen=new Uint8Array(N*N);const st=[start];seen[start]=1;let cnt=0;
  while(st.length){const i=st.pop();cnt++;const r=(i/N)|0,c=i%N;
    for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const rr=r+dr,cc=c+dc;if(rr<0||rr>=N||cc<0||cc>=N)continue;const j=rr*N+cc;if(j===skip||seen[j]||reg[j]!==g)continue;seen[j]=1;st.push(j);}}
  return cnt===size;
}
function generate(N,seed){
  const rng=mulberry32(seed);
  for(let attempt=0;attempt<60;attempt++){
    const sol=randomSol(N,rng);
    const isMine=new Uint8Array(N*N);for(let r=0;r<N;r++)isMine[r*N+sol[r]]=1;
    const reg=growRegions(N,sol,rng);
    let cnt=countSolutions(reg,N,40);
    const maxIter=300*N;
    for(let it=0;it<maxIter&&cnt>1;it++){
      const i=Math.floor(rng()*N*N);if(isMine[i])continue;
      const r=(i/N)|0,c=i%N;const dirs=shuffle([[1,0],[-1,0],[0,1],[0,-1]],rng);
      let tgt=-1;
      for(const[dr,dc]of dirs){const rr=r+dr,cc=c+dc;if(rr<0||rr>=N||cc<0||cc>=N)continue;const g2=reg[rr*N+cc];if(g2!==reg[i]){tgt=g2;break;}}
      if(tgt<0)continue;
      const g=reg[i];
      if(!regionConnectedWithout(reg,N,g,i))continue;
      reg[i]=tgt;
      const nc=countSolutions(reg,N,40);
      if(nc<=cnt)cnt=nc;else reg[i]=g;
    }
    if(cnt===1)return{sol,reg,attempt};
  }
  return null;
}
// ==== GENERATOR END ====
if(typeof module!=='undefined'){module.exports={generate};}
