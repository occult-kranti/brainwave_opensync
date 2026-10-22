#!/usr/bin/env python3
"""Compare the browser demo with independent matrix/SVD reference. No peer code read."""
import hashlib,json,subprocess,sys
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'analysis'))
import systems_reference as ref
scales=[.01,.25,.5,1,2,4,10,100]
js="""import {identifiabilityDemo} from './src/identifiability.mjs';
const scales=[.01,.25,.5,1,2,4,10,100];
const bad=[0,-1,NaN,Infinity,1e9];
let rejected=0;for(const scale of bad){try{identifiabilityDemo({scale});}catch{rejected++;}}
console.log(JSON.stringify({runs:scales.map(scale=>identifiabilityDemo({scale})),rejected}));"""
result=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=ROOT,text=True))
errors=[]
for a,row in zip(scales,result['runs']):
 f=np.array(row['frequencyHz']);z,v,r=ref.response(ref.BASE,f);zz,vv,rr=ref.response(ref.scaled(ref.BASE,a),f)
 if row['rank']!=3 or row['nullity']!=1 or row['rankWithVelocity']!=4:raise RuntimeError('rank mismatch')
 if row['analyticNullVector']!=[1,1,1,.5]:raise RuntimeError('null-vector mismatch')
 if max(row['electricalrelativeDifference'],row['reflectedRelativeDifference'],row['velocityRatioError'])>1e-12:raise RuntimeError('invariance fail')
 for key,expected in [('baseImpedanceMagnitudeOhm',abs(z)),('scaledImpedanceMagnitudeOhm',abs(zz))]:
  error=float(np.max(abs(np.array(row[key])-expected)/np.maximum(abs(expected),1e-300)))
  errors.append(error)
  if error>1e-12:raise RuntimeError('impedance mismatch')
 if abs(row['velocityratio']-1/np.sqrt(a))>1e-12:raise RuntimeError('velocity mismatch')
 if row['numericNullResidual']>1e-7:raise RuntimeError('numeric null-witness mismatch')
if result['rejected']!=5:raise RuntimeError('invalid domain not rejected')
receipt={'status':'passed','scope':'Browser vs independent Python impedance functions and SVD rank; synthetic only',
 'scaleCases':len(scales),'curveComparisons':2*201*len(scales),'invalidInputsRejected':result['rejected'],
 'maxRelativeCurveDifference':max(errors),'sourceSha256':{
  name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
  for name in ['src/identifiability.mjs','analysis/systems_reference.py','research/panel/systems/compare_identifiability.py']}}
(ROOT/'research/panel/systems/browser-comparison.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
