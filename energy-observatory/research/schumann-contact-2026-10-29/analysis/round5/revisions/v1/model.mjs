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
export function binomialTail({n,p,h}){
 trials(n);probability('p',p);integerThreshold(h);
 if(h<=0)return 1;if(h>n)return 0;
 return Math.min(1,sum(binomialPmf({n,p}).slice(h)));
}
export function rejectionThreshold({n,p,alpha=.05}){
 trials(n);probability('p',p);probability('alpha',alpha);if(alpha===0||alpha===1)throw new RangeError('alpha must be strictly between 0 and 1');
 const pmf=binomialPmf({n,p}),tails=Array(n+2).fill(0);let accum=0,comp=0;
 for(let j=n;j>=0;j--){const adjusted=pmf[j]-comp,next=accum+adjusted;comp=(next-accum)-adjusted;accum=next;tails[j]=Math.min(1,accum);}
 tails[0]=1;const h=tails.findIndex(t=>t<=alpha);
 return{h,attainable:h<=n,tailAtThreshold:tails[h],tailAtPrevious:h>0?tails[h-1]:null,alpha};
}
export function leakDistribution({n,k,epsilon}){
 trials(n);targets(k);probability('epsilon',epsilon);
 const q=epsilon+(1-epsilon)/k,success=q,failure=(1-epsilon)*(k-1)/k;
 let mixturePmf=[1];
 for(let t=0;t<n;t++){const next=Array(t+2).fill(0);for(let h=0;h<mixturePmf.length;h++){next[h]+=mixturePmf[h]*failure;next[h+1]+=mixturePmf[h]*success;}mixturePmf=next;}
 return{q,mixturePmf,sameQBinomialPmf:binomialPmf({n,p:q}),
  assumption:'Each trial independently has a perfect ordinary leak with probability epsilon, otherwise an independent uniform blind guess',
  identity:'Any independent information mechanism with the same per-trial hit probability q has this same binomial hit-count law; hit counts cannot identify the mechanism'};
}
export function contamination({n,k,h,m}){
 trials(n);targets(k);hitCount(n,h);if(!Number.isInteger(m)||m<0||m>n)throw new RangeError('m must be an integer from 0 through n');
 return{n,k,h,m,remainingThreshold:h-m,
  preselectedSubset:{tail:binomialTail({n:n-m,p:1/k,h:h-m}),interpretation:'Fixed/preselected compromised subset of exactly m trials, all correct; remaining n-m independent uniform blind trials. This is the stated worst case for at most m preselected compromised trials.'},
  arbitraryOutcomeCorruption:{upperBound:binomialTail({n,p:1/k,h:h-m}),interpretation:'At most m entries of the underlying n-trial independent blind-guess vector may be changed after outcomes. Success can increase by at most m; this is the corresponding conservative tail bound.'},
  limitation:'m is an assumed sensitivity parameter, not estimated, measured or certified; do not substitute preselected-subset tail for outcome-dependent corruption'};
}
export function score({n,k,h,alpha=.05}){
 trials(n);targets(k);hitCount(n,h);
 return{n,k,h,guessProbability:1/k,upperTail:binomialTail({n,p:1/k,h}),threshold:rejectionThreshold({n,p:1/k,alpha}),
  assumption:'Targets are independent and uniform conditional on the responses and prior history; fixed n, fixed scoring, no selective exclusions or optional stopping',
  scope:'Conditional information-score calculation only; no mechanism identification or contact validation'};
}
