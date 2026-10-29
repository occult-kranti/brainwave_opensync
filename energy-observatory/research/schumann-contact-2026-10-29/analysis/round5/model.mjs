// Exact-test formulas evaluated in binary64, not arbitrary-precision probabilities.
export const MAX_TRIALS=1000,MAX_TARGETS=1000000;
function trials(n){if(!Number.isInteger(n)||n<0||n>MAX_TRIALS)throw new RangeError('n must be an integer from 0 through 1000');}
function probability(name,p){if(typeof p!=='number'||!Number.isFinite(p)||p<0||p>1)throw new RangeError(`${name} must be finite in [0,1]`);}
function targets(k){if(!Number.isInteger(k)||k<2||k>MAX_TARGETS)throw new RangeError('k must be an integer from 2 through 1000000');}
function integerThreshold(h){if(!Number.isSafeInteger(h))throw new RangeError('h must be a safe integer');}
function hitCount(n,h){integerThreshold(h);if(h<0||h>n)throw new RangeError('observed h must lie between 0 and n');}
const sum=values=>{let total=0,compensation=0;for(const value of values){const adjusted=value-compensation,next=total+adjusted;compensation=(next-total)-adjusted;total=next;}return total;};
export function binomialPmf({n,p}){
 trials(n);probability('p',p);const weights=Array(n+1).fill(0);
 if(n===0||p===0){weights[0]=1;return weights;}
 if(p===1){weights[n]=1;return weights;}
 const mode=Math.min(n,Math.floor((n+1)*p));weights[mode]=1;
 for(let j=mode;j>0;j--)weights[j-1]=weights[j]*(j/(n-j+1))*((1-p)/p);
 for(let j=mode;j<n;j++)weights[j+1]=weights[j]*((n-j)/(j+1))*(p/(1-p));
 const normalizer=sum(weights);return weights.map(w=>w/normalizer);
}
function logPmf({n,p}){
 const logs=Array(n+1).fill(-Infinity);if(n===0||p===0){logs[0]=0;return logs;}if(p===1){logs[n]=0;return logs;}
 const mode=Math.min(n,Math.floor((n+1)*p)),lp=Math.log(p),lq=Math.log1p(-p);logs[mode]=0;
 for(let j=mode;j>0;j--)logs[j-1]=logs[j]+Math.log(j)-Math.log(n-j+1)+lq-lp;
 for(let j=mode;j<n;j++)logs[j+1]=logs[j]+Math.log(n-j)-Math.log(j+1)+lp-lq;
 const normalizer=Math.log(sum(logs.map(Math.exp)));return logs.map(v=>v-normalizer);
}
const logAdd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
export function binomialTailInfo({n,p,h}){
 trials(n);probability('p',p);integerThreshold(h);
 if(h<=0)return{probability:1,logProbability:0,status:'exact-one'};
 if(h>n||p===0)return{probability:0,logProbability:null,status:'exact-zero'};
 if(p===1)return{probability:1,logProbability:0,status:'exact-one'};
 const value=Math.min(1,sum(binomialPmf({n,p}).slice(h)));
 const logProbability=Math.min(0,logPmf({n,p}).slice(h).reduce(logAdd,-Infinity));
 return{probability:value===0?null:value,logProbability,status:value===0?'positive-underflow':'finite-positive-rounded'};
}
export function binomialTail(request){
 const info=binomialTailInfo(request);if(info.status==='positive-underflow')throw new RangeError('positive tail underflows binary64; use tailInfo for finite log probability');return info.probability;
}
export function pmfInfo({n,p}){
 const values=binomialPmf({n,p}),logs=logPmf({n,p}),underflowIndices=[];
 for(let h=0;h<values.length;h++)if(values[h]===0&&Number.isFinite(logs[h]))underflowIndices.push(h);
 return{probabilities:values.map((v,h)=>underflowIndices.includes(h)?null:v),logProbabilities:logs.map(v=>Number.isFinite(v)?v:null),positiveUnderflowIndices:underflowIndices,
  scope:'Binary64 approximation. Null probability with finite log means positive underflow; exact zero has null log.'};
}
export function rejectionThreshold({n,p,alpha=.05}){
 trials(n);probability('p',p);probability('alpha',alpha);if(alpha===0||alpha===1)throw new RangeError('alpha must be strictly between 0 and 1');
 const pmf=binomialPmf({n,p}),tails=Array(n+2).fill(0);let accum=0,comp=0;
 for(let j=n;j>=0;j--){const adjusted=pmf[j]-comp,next=accum+adjusted;comp=(next-accum)-adjusted;accum=next;tails[j]=Math.min(1,accum);}
 tails[0]=1;
 let h=tails.findIndex(t=>t<=alpha);
 if(tails[h]===0&&h<=n&&p>0&&p<1){const logs=logPmf({n,p}),logTails=Array(n+2).fill(-Infinity);for(let j=n;j>=0;j--)logTails[j]=logAdd(logTails[j+1],logs[j]);h=logTails.findIndex(t=>t<=Math.log(alpha));}
 const at=binomialTailInfo({n,p,h}),previous=h>0?binomialTailInfo({n,p,h:h-1}):null;
 return{h,attainable:h<=n,tailAtThreshold:at.probability,tailAtPrevious:previous?.probability??null,tailAtThresholdInfo:at,tailAtPreviousInfo:previous,alpha};
}
export function leakDistribution({n,k,epsilon}){
 trials(n);targets(k);probability('epsilon',epsilon);
 const q=epsilon+(1-epsilon)/k,success=q,failure=(1-epsilon)*(k-1)/k;
 let mixturePmf=[1];
 for(let t=0;t<n;t++){const next=Array(t+2).fill(0);for(let h=0;h<mixturePmf.length;h++){next[h]+=mixturePmf[h]*failure;next[h+1]+=mixturePmf[h]*success;}mixturePmf=next;}
 const sameQ=pmfInfo({n,p:q}),mixtureUnderflowIndices=[];
 if(q>0&&q<1)for(let h=0;h<mixturePmf.length;h++)if(mixturePmf[h]===0)mixtureUnderflowIndices.push(h);
 return{q,mixturePmf:mixturePmf.map((v,h)=>mixtureUnderflowIndices.includes(h)?null:v),mixtureUnderflowIndices,sameQBinomialPmf:sameQ.probabilities,sameQLogPmf:sameQ.logProbabilities,sameQUnderflowIndices:sameQ.positiveUnderflowIndices,
  assumption:'Each trial independently has a perfect ordinary leak with probability epsilon, otherwise an independent uniform blind guess',
  identity:'Any independent information mechanism with the same per-trial hit probability q has this same binomial hit-count law; hit counts cannot identify the mechanism'};
}
export function contamination({n,k,h,m}){
 trials(n);targets(k);hitCount(n,h);if(!Number.isInteger(m)||m<0||m>n)throw new RangeError('m must be an integer from 0 through n');
 const a=binomialTailInfo({n:n-m,p:1/k,h:h-m}),b=binomialTailInfo({n,p:1/k,h:h-m});
 return{n,k,h,m,remainingThreshold:h-m,
  preselectedSubset:{tail:a.probability,numericStatus:a.status,logTail:a.logProbability,interpretation:'Fixed/preselected compromised subset of exactly m trials, all correct; remaining n-m independent uniform blind trials. This is the stated worst case for at most m preselected compromised trials.'},
  arbitraryOutcomeCorruption:{upperBound:b.probability,numericStatus:b.status,logUpperBound:b.logProbability,interpretation:'At most m entries of the underlying n-trial independent blind-guess vector may be changed after outcomes. Success can increase by at most m; this is the corresponding conservative tail bound.'},
  limitation:'m is an assumed sensitivity parameter, not estimated, measured or certified; do not substitute preselected-subset tail for outcome-dependent corruption'};
}
export function score({n,k,h,alpha=.05}){
 trials(n);targets(k);hitCount(n,h);
 const info=binomialTailInfo({n,p:1/k,h});
 return{n,k,h,guessProbability:1/k,upperTail:info.probability,upperTailInfo:info,threshold:rejectionThreshold({n,p:1/k,alpha}),
  assumption:'Targets are independent and uniform conditional on the responses and prior history; fixed n, fixed scoring, no selective exclusions or optional stopping',
  scope:'Conditional information-score calculation only; no mechanism identification or contact validation'};
}
