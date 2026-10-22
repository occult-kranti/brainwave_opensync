#!/usr/bin/env python3
"""Fresh matrix/Kraus/unitary reconstruction, frozen before quantum.mjs inspection.
Reference states use arbitrary complex phases; ergotropy is phase-invariant for
the declared diagonal two-level Hamiltonian and ideal unrestricted unitaries.
"""
from pathlib import Path
import argparse, hashlib, itertools, json, math, subprocess
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
PLANCK=6.62607015e-34

def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def require(ok,msg):
    if not bool(ok):raise ValueError(msg)
def state(p,k,phase):
    c=k*math.sqrt(p*(1-p))*np.exp(1j*phase)
    return np.array([[1-p,c],[c.conjugate(),p]],dtype=complex)
def damp(rho,g,d):
    a0=np.diag([1,math.sqrt(1-g)]);a1=np.array([[0,math.sqrt(g)],[0,0]])
    after=a0@rho@a0.conj().T+a1@rho@a1.conj().T
    z=np.diag([1,-1]);return ((1+d)/2)*after+((1-d)/2)*(z@after@z)
def matrix_result(rho):
    h=np.diag([0,1]);vals,vecs=np.linalg.eigh(rho);energy=float(np.trace(rho@h).real)
    descending=np.argsort(vals)[::-1];unitary=vecs[:,descending].conj().T
    final=unitary@rho@unitary.conj().T
    passive=float(np.trace(final@h).real);alternative=float(np.dot(vals[descending],[0,1]))
    require(np.max(np.abs(unitary@unitary.conj().T-np.eye(2)))<2e-15,'unitarity')
    require(abs(passive-alternative)<2e-15,'passive energy')
    require(abs(float(np.trace(rho).real)-1)<2e-15 and vals[0]>=-2e-15,'physical state')
    return energy,passive,energy-passive,float(vals[0])
def brute_min(rho):
    # Two angles suffice to rotate a qubit Bloch vector to either energy axis.
    best=2.0;theta_best=phi_best=0
    for phase in np.linspace(0,2*np.pi,361):
        rz=np.diag([np.exp(-1j*phase/2),np.exp(1j*phase/2)])
        r=rz@rho@rz.conj().T
        for theta in np.linspace(0,np.pi,181):
            c=math.cos(theta/2);s=math.sin(theta/2);ry=np.array([[c,-s],[s,c]])
            e=float((ry@r@ry.T)[1,1].real)
            if e<best:best=e;theta_best=float(theta);phi_best=float(phase)
    return {'sampled_min_energy_over_gap':best,'theta_rad':theta_best,'phi_rad':phi_best,'grid':[181,361]}
def references():
    rows=[];min_eig=1.0;max_energy_residual=0.0
    for p,k,g,d,phase in itertools.product([0,.05,.25,.5,.9,1],[0,.3,.8,1],[0,.2,1],[0,.4,1],[0,np.pi/3,np.pi/2]):
        initial=state(p,k,phase);rho=damp(initial,g,d)
        ei,pi,wi,mi=matrix_result(initial);ef,pf,wf,mf=matrix_result(rho)
        dephased=np.diag(np.diag(rho));_,_,wd,_=matrix_result(dephased)
        # Energy carried by the zero-temperature amplitude-damping channel.
        heat=ei-ef
        require(wf>=-2e-15 and wf<=ef+2e-15 and wd<=wf+2e-15,'work bounds')
        require(abs(heat-g*ei)<2e-15,'amplitude damping energy')
        min_eig=min(min_eig,mi,mf);max_energy_residual=max(max_energy_residual,abs(ei-ef-g*ei))
        rows.append([p,k,g,d,float(phase),ei,ef,pf,wf,wd,heat])
    brute=[]
    for p,k,g,d,phase in [(0.25,1,0,1,np.pi/3),(.9,.3,.2,.4,np.pi/2),(.5,0,0,1,0)]:
        rho=damp(state(p,k,phase),g,d);_,bound,_,_=matrix_result(rho);b=brute_min(rho);gap=b['sampled_min_energy_over_gap']-bound
        require(gap>=-2e-14 and gap<1e-4,'finite unitary search versus bound')
        brute.append({'parameters':[p,k,g,d,float(phase)],'exact_passive_energy_over_gap':bound,'sampled_gap_above_bound':gap,**b})
    return {'schema':'metrology-quantum-fixtures/1','status':'independent model-agent matrix/Kraus/unitary reconstruction; no producer code read before freeze','frequency_Hz':5e9,'gap_J':PLANCK*5e9,
      'columns':['population','coherence','damping','dephasing','phase_rad','initial_energy_over_gap','final_energy_over_gap','passive_energy_over_gap','ergotropy_over_gap','diagonal_ergotropy_over_gap','released_energy_over_gap'],
      'case_count':len(rows),'rows':rows,'minimum_state_eigenvalue':min_eig,'max_energy_closure_over_gap':max_energy_residual,'direct_unitary_sweeps':brute,
      'method':'Hermitian eigendecomposition, Kraus matrix channels, explicit eigenbasis rotation and finite two-angle unitary search. No scalar Bloch-length ergotropy formula used.',
      'limits':'The matrix sorting argument supplies the bound; finite unitary samples corroborate selected states only. No device/control energy inferred from density-matrix work.'}

def compare(path):
    fixtures=json.loads(path.read_text());gap=fixtures['gap_J']
    inputs=[dict(frequencyHz=fixtures['frequency_Hz'],population=r[0],coherence=r[1],damping=r[2],dephasing=r[3]) for r in fixtures['rows']]
    code="""import {qubitWork} from './src/quantum.mjs';
const xs=JSON.parse(process.argv[1]); console.log(JSON.stringify(xs.map(x=>{
const r=qubitWork(x);return {row:[r.initial.energyJ,r.final.energyJ,r.final.passiveEnergyJ,r.final.ergotropyJ,r.final.diagonalErgotropyJ,r.environmentalEnergyJ],gapJ:r.gapJ,apparatusEfficiency:r.apparatusEfficiency,status:r.status};})));"""
    got=json.loads(subprocess.check_output(['node','--input-type=module','-e',code,json.dumps(inputs)],cwd=ROOT,text=True))
    errors=[]
    for row,check in zip(fixtures['rows'],got):
        require(check['gapJ']==gap,'energy gap')
        require(check['apparatusEfficiency'] is None,'state model misreported as apparatus efficiency')
        normalized=np.array(check['row'])/gap;expected=np.array(row[5:11]);errors.extend(abs(normalized-expected).tolist())
    require(max(errors)<2e-13,'matrix/producer disagreement')
    # A passive mixed state stores energy while its unitary extractable work is zero.
    passive=[r for r in fixtures['rows'] if r[:5]==[.25,0,0,1,0]][0]
    require(passive[5]>.24 and abs(passive[8])<2e-15,'passive mixed-state discriminator')
    return {'status':'passed','date':'2026-10-21','case_count':len(got),'max_absolute_difference_over_gap':max(errors),
      'phase_coordinates_per_parameter_case':3,'independence':'A separate model-agent froze matrix/Kraus/unitary fixtures before reading quantum.mjs. No scalar producer formula reused.',
      'fixture_sha256':digest(path),'producer_sha256':digest(ROOT/'src/quantum.mjs'),'checker_sha256':digest(__file__),
      'direct_unitary_sweeps':fixtures['direct_unitary_sweeps'],'semantic_guards':{'apparatus_efficiency_null':True,'passive_mixed_state_wrong_estimator_W_equals_E_rejected':True},
      'scope':'Checks ideal two-level state work and declared channels, not experimental quantum hardware or total preparation/control/reset energy.'}

def main():
    p=argparse.ArgumentParser();mode=p.add_mutually_exclusive_group(required=True);mode.add_argument('--freeze-fixtures',type=Path);mode.add_argument('--compare',type=Path);p.add_argument('--output',type=Path);a=p.parse_args()
    if a.compare:
        if a.output is None:p.error('--output required for --compare')
        result=compare(a.compare);a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
    else:
        result=references();a.freeze_fixtures.parent.mkdir(parents=True,exist_ok=True)
        a.freeze_fixtures.write_text(json.dumps(result,separators=(',',':'))+'\n')
        print(json.dumps({'status':'frozen','cases':result['case_count'],'sha256':digest(a.freeze_fixtures),'source_sha256':digest(__file__),'unitary_grid_per_case':[181,361]}))
if __name__=='__main__':main()
