const {generate}=require('./gen.js');const {rateBoard,scoreOf}=require('./rate.js');
// [first mission, last mission, size, start percentile, end percentile] - each new size starts easier, since the bigger board is already a step up
const BANDS=[[1,8,5,0,0.72],[9,18,6,0.12,0.86],[19,30,7,0.22,0.93],[31,42,8,0.32,0.96],[43,50,9,0.45,0.995]];
const seeds=[],report=[];
for(const[a,b,N,p0,p1]of BANDS){
  const pool=[];for(let s=1;s<=600;s++){const seed=N*1000+s;const p=generate(N,N*100000+seed);if(!p)continue;const r=rateBoard(p.reg,N);if(r.level>=6)continue;pool.push({seed,r,sc:scoreOf(r)});}
  pool.sort((x,y)=>x.sc-y.sc);const taken=new Set();
  for(let m=a;m<=b;m++){const f=b===a?0:(m-a)/(b-a);let idx=m<=3?m-1:Math.round((p0+(p1-p0)*f)*(pool.length-1));
    while(taken.has(idx))idx++;taken.add(idx);const c=pool[idx];seeds.push(c.seed);report.push(`${m}:${N}x${N} L${c.r.level}`);}
}
console.log(report.join('  '));
require('fs').writeFileSync('seeds.json',JSON.stringify(seeds));
