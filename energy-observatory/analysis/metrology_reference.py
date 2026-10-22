#!/usr/bin/env python3
"""Independent-formulation synthetic metrology controls; no physical measurements.
Same reviewer authored this reference and metrology.mjs. Independence from the
other panel producers is preserved; waveform quadrature cross-checks cosine.
"""
from pathlib import Path
import argparse, csv, hashlib, itertools, json, math, subprocess
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
C=np.array([1,1,1,-1,-1,-1],dtype=float)

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def require(ok,message):
    if not bool(ok):raise ValueError(message)
def js_eval(payload):
    script="""import {energyClosure,phasePower,closureUncertainty} from './src/metrology.mjs';
const p=JSON.parse(process.argv[1]);
const badCalls=[()=>energyClosure({standardUncertaintyJ:-1}),()=>energyClosure({coverageFactor:0}),()=>energyClosure({lossJ:-1}),()=>energyClosure({sourceJ:Infinity}),()=>phasePower({frequencyHz:0}),()=>phasePower({voltageRmsV:-1}),()=>closureUncertainty({covarianceJ2:[[1]]})];
const edge={rejected:badCalls.map(fn=>{try{fn();return false;}catch{return true;}}),zeroUncertainty:energyClosure({standardUncertaintyJ:0}).status,negativeResidual:energyClosure({loadJ:.5}).status,positiveResidual:energyClosure({loadJ:1}).status,quadratureRelativeBias:phasePower({phaseDeg:90}).relativeBias};
const out={edge,phase:p.phase.map(x=>phasePower(x)),storage:p.storage.map(x=>energyClosure(x)),covariance:p.covariance.map(x=>{try{return {accepted:true,...closureUncertainty({covarianceJ2:x})};}catch(e){return {accepted:false,error:e.message};}})};
console.log(JSON.stringify(out));"""
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',script,json.dumps(payload)],cwd=ROOT,text=True))

def make_cards(directory,key_path):
    directory.mkdir(parents=True,exist_ok=True)
    t=np.arange(2001)/100000;w=2*math.pi*1000;delta=w*1e-6
    v=math.sqrt(2)*np.cos(w*t); i=math.sqrt(2)*np.cos(w*t-math.radians(85)-delta)
    rows=np.column_stack([t,v,i,np.ones(len(t)),np.full(len(t),.08),v,math.sqrt(2)*np.cos(w*t-delta)])
    header=['time_s','input_voltage_V','input_current_A','load_voltage_V','load_current_A','reference_voltage_V','reference_current_A']
    with (directory/'card-41.csv').open('w',newline='') as f:
        z=csv.writer(f);z.writerow(header);z.writerows(rows)
    metadata={'schema':'blind-energy-card/1','status':'synthetic; no hardware','cards':[
      {'id':'card-41','file':'card-41.csv','window_s':[0,.02],'sample_rate_hz':100000,'loss_J':(math.cos(math.radians(85))-.08)*.02,'storage_change_J':0,'notes':['Reference channels were simultaneously acquired from a declared in-phase, unit-RMS calibration source.','Each trace includes both integration endpoints; estimate by trapezoidal integration.','Treat supplied calibration and loss values as exact for this synthetic exercise.']},
      {'id':'card-72','file':'card-72.csv','window_s':[0,1],'sample_rate_hz':100,'loss_J':.02,'component_certificate':{'capacitor_F':.02},'notes':['Auxiliary voltage probe is connected across the capacitor.','Treat stated component values as exact for this synthetic exercise.']},
      {'id':'card-19','file':'card-19.csv','window_s':[0,1],'sample_rate_hz':100,'loss_J':.02,'storage_change_J':0,'notes':['Recorded ports: main input and load.','Boundary wiring inventory also lists a controller supply with no corresponding power channel.','No calibration bounds on an unmeasured port are supplied.']}
    ]}
    t=np.linspace(0,1,101)
    for name,current,aux in [('card-72',.18,np.sqrt(np.maximum(10*(1-t),0))),('card-19',.12,None)]:
        rows=np.column_stack([t,np.ones(len(t)),np.full(len(t),.1),np.ones(len(t)),np.full(len(t),current)])
        names=['time_s','input_voltage_V','input_current_A','load_voltage_V','load_current_A']
        if aux is not None:rows=np.column_stack([rows,aux]);names.append('auxiliary_voltage_V')
        with (directory/(name+'.csv')).open('w',newline='') as f:z=csv.writer(f);z.writerow(names);z.writerows(rows)
    metadata['files_sha256']={p.name:digest(p) for p in sorted(directory.glob('*.csv'))}
    (directory/'cards.json').write_text(json.dumps(metadata,indent=2)+'\n')
    key={'status':'synthetic injection key, withheld until diagnostic review','cards':{
      'card-41':{'injected_differential_current_delay_s':1e-6,'true_input_phase_deg':85,'expected':'Use in-phase reference to estimate/correct channel skew; corrected input balances load plus loss. A generic unknown device phase alone is not enough to identify skew.'},
      'card-72':{'initial_storage_J':.1,'final_storage_J':0,'expected':'Initial capacitor energy release accounts for 0.1 J apparent surplus if storage was omitted.'},
      'card-19':{'unrecorded_controller_input_J':.04,'expected':'The records leave an unmetered input and do not uniquely identify the residual cause or actual controller energy. State the 0.04 J budget gap conditionally, not as a measurement.'}},
      'raw_cards_manifest_sha256':digest(directory/'cards.json')}
    key_path.parent.mkdir(parents=True,exist_ok=True);key_path.write_text(json.dumps(key,indent=2)+'\n')
    return {'manifest_sha256':digest(directory/'cards.json'),'card_count':3,'csv_files_sha256':metadata['files_sha256']}

def run():
    phase=[];phase_ref=[]
    for phi,f,us in itertools.product([0,30,60,80,85,88,89],[100,1000,10000],[-10,-1,0,1,10]):
        # 20 cycles, 256 samples/cycle, both endpoints; separate waveform quadrature.
        t=np.linspace(0,20/f,20*256+1);v=np.sqrt(2)*np.cos(2*np.pi*f*t)
        current=np.sqrt(2)*np.cos(2*np.pi*f*t-np.deg2rad(phi)-2*np.pi*f*us*1e-6)
        power=float(np.trapezoid(v*current,t)/(t[-1]-t[0]));expected=math.cos(math.radians(phi)+2*math.pi*f*us*1e-6)
        require(abs(power-expected)<2e-13,'waveform/cosine disagreement')
        phase.append(dict(voltageRmsV=1,currentRmsA=1,phaseDeg=phi,frequencyHz=f,delayUs=us));phase_ref.append(power)
    storage=[];storage_ref=[]
    for s,h in itertools.product([0,.01,.1,.5],repeat=2):
        row=dict(sourceJ=1,environmentJ=h,loadJ=.8+s+h,lossJ=.2,initialStorageJ=s,finalStorageJ=0,standardUncertaintyJ=.01)
        complete=row['loadJ']+row['lossJ']-s-1-h
        require(abs(complete)<1e-15,'complete closure failure')
        wrong_hidden=row['loadJ']+row['lossJ']-s-1;wrong_both=row['loadJ']+row['lossJ']-1
        require(abs(wrong_hidden-h)<1e-15 and abs(wrong_both-s-h)<1e-15,'omission behavior incorrect')
        storage.append(row);storage_ref.append({'s_J':s,'h_J':h,'complete_R_J':complete,'omit_hidden_R_J':wrong_hidden,'omit_both_R_J':wrong_both})
    alias=[]
    for fs in [1000,10000]:
        t=np.arange(fs+1)/fs;v=np.sqrt(2)*np.cos(2*np.pi*700*t);current=np.sqrt(2)*np.cos(2*np.pi*300*t)
        e=float(np.trapezoid(v*current,t));expected=1 if fs==1000 else 0
        require(abs(e-expected)<2e-13,'alias control failed');alias.append({'fs_Hz':fs,'sampled_energy_J':e,'bandwidth_contract_valid':fs>2*700})
    # Factor-built positive-semidefinite examples, with independent eigensolver validation.
    shared=np.array([.008,.002,0,0,.01,0]);shared_cov=np.outer(shared,shared)
    independent=np.diag(np.array([.008,.002,0,0,.01,0])**2)
    endpoint=np.zeros((6,6));endpoint[2,2]=endpoint[3,3]=.0001;endpoint[2,3]=endpoint[3,2]=.00009
    zeros=np.zeros((6,6));rng=np.random.default_rng(711);random_factor=rng.normal(size=(6,4))*1e-3;random_cov=random_factor@random_factor.T
    bad=np.eye(6);bad[0,1]=bad[1,0]=.9;bad[0,2]=bad[2,0]=.9;bad[1,2]=bad[2,1]=-.9
    matrices=[shared_cov,independent,endpoint,zeros,random_cov,bad]
    refs=[]
    for mat in matrices:
        eigen=np.linalg.eigvalsh(mat);valid=bool(eigen[0]>=-1e-12*max(np.max(np.abs(mat)),1e-300));var=float(C@mat@C)
        refs.append({'valid':valid,'variance_J2':max(0,var) if valid else None,'minimum_eigenvalue_J2':float(eigen[0])})
    require(abs(float(C@shared_cov@C))<1e-18,'common gain cancellation failed')
    require(refs[1]['variance_J2']>0 and not refs[-1]['valid'],'covariance controls failed')
    A=np.array([[1,1,1]],float);kernel=np.array([[1,-1,0],[1,0,-1]],float)
    rank=int(np.linalg.matrix_rank(A));require(rank==1 and np.max(np.abs(A@kernel.T))==0,'rank/kernel failed')
    out=js_eval({'phase':phase,'storage':storage,'covariance':[m.tolist() for m in matrices]})
    require(all(out['edge']['rejected']),'invalid API input admitted')
    require(out['edge']['zeroUncertainty']=='uncertainty-not-established' and out['edge']['negativeResidual']=='negative-residual' and out['edge']['positiveResidual']=='positive-residual' and out['edge']['quadratureRelativeBias'] is None,'edge interpretation failure')
    phase_error=max(abs(r['measuredPowerW']-x) for r,x in zip(out['phase'],phase_ref));require(phase_error<2e-13,'JS phase mismatch')
    storage_error=max(abs(x['residualJ']) for x in out['storage']);require(storage_error<1e-14,'JS closure mismatch')
    for got,ref in zip(out['covariance'],refs):
        require(got['accepted']==ref['valid'],'JS covariance acceptance mismatch')
        if ref['valid']:require(abs(got['varianceJ2']-ref['variance_J2'])<1e-15,'JS covariance value mismatch')
    return {'status':'passed','data_status':'synthetic only; no physical measurements','independence':'Frozen before reading other producers code; same reviewer authored JS and Python but waveform quadrature and NumPy Hermitian eigensolver use different formulations.',
      'api_edge_checks':out['edge'],'phase_grid':{'cells':len(phase),'max_JS_vs_waveform_absolute_error_W':phase_error,'max_absolute_bias_W':max(abs(x['biasW']) for x in out['phase']),'negative_measured_power_count':sum(x['measuredPowerW']<0 for x in out['phase'])},
      'storage_grid':{'cells':len(storage),'max_complete_residual_J':storage_error,'rows':storage_ref},'aliasing_control':alias,'covariance_controls':refs,
      'identifiability':{'domain_dimension':3,'rank':rank,'nullity':3-rank,'kernel_witnesses':kernel.astype(int).tolist()},
      'source_sha256':{'src/metrology.mjs':digest(ROOT/'src/metrology.mjs'),'analysis/metrology_reference.py':digest(__file__)},
      'scope':'Finite controls verify the declared arithmetic and expose wrong inference; they do not establish experimental energy closure or complete channel observability.'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--cards-dir',type=Path);parser.add_argument('--key-output',type=Path);args=parser.parse_args()
    if (args.cards_dir is None)!=(args.key_output is None):parser.error('--cards-dir and --key-output are required together')
    result=run()
    if args.cards_dir:result['blind_cards']=make_cards(args.cards_dir,args.key_output)
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'phase_cells':result['phase_grid']['cells'],'storage_cells':result['storage_grid']['cells'],'max_phase_error_W':result['phase_grid']['max_JS_vs_waveform_absolute_error_W'],'output':str(args.output)}))
if __name__=='__main__':main()
