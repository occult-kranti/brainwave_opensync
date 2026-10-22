#!/usr/bin/env python3
"""Blind card diagnosis: reads only cards.json and its three named CSVs.
No producer reference or answer key is used. No new physical data are created.
"""
from pathlib import Path
import argparse
import hashlib
import json
import numpy as np

parser=argparse.ArgumentParser()
parser.add_argument('--cards',type=Path,default=Path('/workspace/scratch/f431d34f6f71/energy-panel/metrology/blind-cards'))
parser.add_argument('--output',type=Path,default=Path(__file__).with_name('blind-diagnosis.json'))
args=parser.parse_args()
meta=json.loads((args.cards/'cards.json').read_text())
rows=[]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for card in meta['cards']:
    path=args.cards/card['file']
    if sha(path)!=meta['files_sha256'][card['file']]:raise ValueError('Card hash mismatch')
    a=np.genfromtxt(path,delimiter=',',names=True)
    t=a['time_s']
    if np.any(np.diff(t)<=0):raise ValueError('Nonmonotone time')
    e_in=float(np.trapezoid(a['input_voltage_V']*a['input_current_A'],t))
    e_load=float(np.trapezoid(a['load_voltage_V']*a['load_current_A'],t))
    raw_residual=e_load+card['loss_J']+card.get('storage_change_J',0)-e_in
    result={'id':card['id'],'inputEnergyJ':e_in,'loadEnergyJ':e_load,'statedLossJ':card['loss_J'],'residualBeforeAdditionalAccountingJ':raw_residual}
    if card['id']=='card-41':
        # Drop the repeated final endpoint only for frequency-bin estimation; retain it for integrals.
        dt=float(t[1]-t[0]);v=a['reference_voltage_V'][:-1]
        spectrum=np.abs(np.fft.rfft(v-v.mean()))
        freq=float(np.fft.rfftfreq(len(v),dt)[np.argmax(spectrum[1:])+1])
        design=np.column_stack([np.cos(2*np.pi*freq*t),np.sin(2*np.pi*freq*t),np.ones(len(t))])
        fits={}
        for name in ['reference_voltage_V','reference_current_A','input_voltage_V','input_current_A']:
            coef=np.linalg.lstsq(design,a[name],rcond=None)[0]
            fits[name]={'amplitude':float(np.hypot(coef[0],coef[1])), 'lagRadians':float(np.arctan2(coef[1],coef[0])), 'offset':float(coef[2]), 'maxFitError':float(np.max(np.abs(design@coef-a[name])))}
        wrap=lambda x:float((x+np.pi)%(2*np.pi)-np.pi)
        delay_phase=wrap(fits['reference_current_A']['lagRadians']-fits['reference_voltage_V']['lagRadians'])
        raw_phase=wrap(fits['input_current_A']['lagRadians']-fits['input_voltage_V']['lagRadians'])
        corrected_phase=wrap(raw_phase-delay_phase)
        rms_product=fits['input_voltage_V']['amplitude']*fits['input_current_A']['amplitude']/2
        corrected_energy=float((t[-1]-t[0])*rms_product*np.cos(corrected_phase))
        result.update(status='phase-calibration inconsistency; closure restored under stated common-transfer assumption',
          frequencyHz=freq,referenceCurrentRelativeLagRad=delay_phase,
          equivalentPrincipalDelayS=delay_phase/(2*np.pi*freq),rawInputPhaseDeg=raw_phase*180/np.pi,
          correctedInputPhaseDeg=corrected_phase*180/np.pi,conditionalCorrectedInputEnergyJ=corrected_energy,
          conditionalCorrectedResidualJ=e_load+card['loss_J']-corrected_energy,fits=fits,
          ambiguity='Single-frequency phase identifies delay modulo a period. Applying the reference correction to the input channel requires the same transfer-path calibration; simultaneous acquisition alone does not prove that.',
          nextMeasurement='Verify identical current/voltage transfer paths, then calibrate differential gain and phase across the occupied bandwidth using a common-clock reference.')
    elif card['id']=='card-72':
        capacitance=card['component_certificate']['capacitor_F']
        u0=float(capacitance*a['auxiliary_voltage_V'][0]**2/2)
        u1=float(capacitance*a['auxiliary_voltage_V'][-1]**2/2)
        result.update(status='apparent surplus accounted for by measured capacitor depletion in the admitted model',
          capacitorInitialEnergyJ=u0,capacitorFinalEnergyJ=u1,storageChangeJ=u1-u0,
          correctedResidualJ=e_load+card['loss_J']+(u1-u0)-e_in,
          ambiguity='Closure is conditional on the stated linear, constant-capacitance certificate and admitted channels; it does not independently certify a physical apparatus.',
          nextMeasurement='Include preparation/recharge and reset within the measurement window; confirm endpoint voltage and capacitance calibration.')
    elif card['id']=='card-19':
        result.update(status='unresolved residual with known incomplete boundary',
          requiredAdditionalInputIfOnlyMissingTermJ=raw_residual,
          ambiguity='The listed unmetered controller supply is a plausible omitted input. Its actual energy is not measured; one scalar residual cannot distinguish it from calibration bias, omitted storage or another missing transfer.',
          nextMeasurement='Acquire signed simultaneous voltage-current data on the controller supply; audit every port and initial/final storage before assigning a cause.')
    rows.append(result)
record={'status':'blind-response-frozen-before-key-access','date':'2026-10-22','agent':'energy_quantum',
 'readInputs':['cards.json','card-41.csv','card-72.csv','card-19.csv'],
 'inputSHA256':{p:sha(args.cards/p) for p in ['cards.json','card-41.csv','card-72.csv','card-19.csv']},
 'method':'Independent CSV time-product trapezoid integration; sinusoidal least-squares calibration; capacitor endpoint energy.',
 'sign':'positive residual means apparent excess output: load + loss + storage change - recorded input',
 'physicalMeasurements':0,'diagnoses':rows,'newEnergyClaim':False}
args.output.write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
