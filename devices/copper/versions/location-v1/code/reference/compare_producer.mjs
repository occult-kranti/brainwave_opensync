import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as m from '../src/models.mjs';
const j=JSON.parse(fs.readFileSync(new URL('./independent-fixtures.json',import.meta.url)));
let comparisons=0;const deviations=[];
function near(a,b,label,tolerance=1e-10){const err=Math.abs(a-b)/Math.max(Math.abs(b),1e-300);assert.ok(err<tolerance,`${label}: ${a} vs ${b}, relative ${err}`);deviations.push({label,relativeError:err});comparisons++;}
const s=m.solidBreathing({youngPa:110e9,poisson:.34,densityKgM3:8960,radiusM:.01});
near(s.root,j.solid_20mm.roots[0],'solid root');near(s.frequencyHz,j.solid_20mm.frequencies_Hz[0],'solid frequency');near(s.massKg,j.solid_20mm.mass_kg,'solid physical mass');
for(let i=0;i<4;i++)near(m.solidBreathing({youngPa:110e9,poisson:.34,densityKgM3:8960,radiusM:.01,rootIndex:i}).frequencyHz,j.solid_20mm.frequencies_Hz[i],`radial mode ${i}`);
const sh=m.shellBreathing({youngPa:110e9,poisson:.34,densityKgM3:8960,radiusM:.04445,thicknessM:.0005});
near(sh.frequencyHz,j.shells_illustrative[1].thin_breathing_Hz,'shell frequency');near(sh.geometricMassKg,j.shells_illustrative[1].mass_exact_kg,'shell exact geometric mass');
const d=m.solidBreathing({radiusM:.01});near(d.frequencyHz,j.solid_20mm_NIST_reference.frequencies_Hz[0],'NIST-reference frequency');
for(const [label,v] of [['A',j.coupled_A],['B',j.coupled_B]]){
const system=m.coupledSystem({sphereHz:22000,tableHz:21800,sphereModalMassKg:.1,tableModalMassKg:1,contactNpm:1e8,position:Math.asin(v.phi)/Math.PI,sphereDamping:.002,tableDamping:.01});
for(let i=0;i<2;i++)near(system.frequencyHz[i],v.eigenfrequencies_Hz[i],`${label} eigen ${i}`);
for(const p of v.frf){const r=m.responseAt(system,p.frequency_Hz);near(r.sphereRe,p.sphere_compliance_m_N.real,`${label}/${p.frequency_Hz} sphere real`);near(r.sphereIm,p.sphere_compliance_m_N.imag,`${label}/${p.frequency_Hz} sphere imag`);near(r.tableRe,p.table_compliance_m_N.real,`${label}/${p.frequency_Hz} table real`);near(r.tableIm,p.table_compliance_m_N.imag,`${label}/${p.frequency_Hz} table imag`);}
}
near(m.thermalShift({frequencyHz:s.frequencyHz,deltaK:.1}).fractionalShift,j.thermal.fractional_shift,'mass-conserving thermal fraction',1e-8);
near(m.gravitationalShift({frequencyHz:22000,heightM:.001}).shiftHz,j.redshift.shift_at_22000_Hz,'gravity comparison');
// Direct numerical radial mass integral independently checks the producer's Bessel identity.
let integral=0;const n=100000;for(let i=0;i<n;i++){const t=(i+.5)/n;const shape=m.sphericalJ1(s.root*t)/m.sphericalJ1(s.root);integral+=t*t*shape*shape/n;}
near(s.modalMassKg,4*Math.PI*8960*.01**3*integral,'solid modal mass vs midpoint quadrature',1e-9);
const iso=m.simulateComparison({coupling:0,positionA:0,positionB:1,receiver:'comoving'});
assert.equal(iso.intrinsicHzA,iso.intrinsicHzB);assert.deepEqual(iso.coupledHzA,iso.coupledHzB);assert.deepEqual(iso.responseA,iso.responseB);comparisons++;
const receiver1=m.simulateComparison({receiver:'comoving'}),receiver2=m.simulateComparison({receiver:'fixed'});
assert.deepEqual(receiver1.coupledHzA,receiver2.coupledHzA);assert.deepEqual(receiver1.coupledHzB,receiver2.coupledHzB);comparisons++;
// Empty-table independent SciPy one-DOF fixtures: local force and local readout.
for(const fixture of j.empty_table){
  const params={tableHz:fixture.table_frequency_Hz,tableModalMassKg:fixture.modal_mass_kg,position:fixture.position,tableDamping:fixture.damping_ratio};
  for(const value of fixture.values){
    const r=m.emptyTablePointResponse(params,value.frequency_Hz);
    near(r.re,value.real,`table ${fixture.position}/${value.frequency_Hz} real`);
    near(r.im,value.imag,`table ${fixture.position}/${value.frequency_Hz} imaginary`);
    near(r.magnitude,value.magnitude,`table ${fixture.position}/${value.frequency_Hz} magnitude`);
    assert.ok(-Math.PI*value.frequency_Hz*r.im>=0,'passive driving-point average power');
  }
}
const tab=m.simulateComparison({coupling:.12,positionA:.25,positionB:.5});
assert.equal(tab.tablePointResponseA.length,tab.frequencyHz.length);
assert.equal(tab.tablePointResponseB.length,tab.frequencyHz.length);
assert.ok(tab.tablePointResponseA.every(Number.isFinite)&&tab.tablePointResponseB.every(Number.isFinite));comparisons++;
// One-mode shape yields an exact amplitude ratio of sin(pi/4)^2 / sin(pi/2)^2 = 1/2.
const ratioError=Math.max(...tab.tablePointResponseA.map((a,i)=>Math.abs(a/tab.tablePointResponseB[i]-.5)));
assert.ok(ratioError<1e-14,'table position amplitude ratio');comparisons++;
const argmax=a=>a.reduce((best,v,i)=>v>a[best]?i:best,0);
assert.equal(argmax(tab.tablePointResponseA),argmax(tab.tablePointResponseB),'table peak is position invariant');comparisons++;
const peakHz=tab.frequencyHz[argmax(tab.tablePointResponseB)];
assert.ok(Math.abs(peakHz/tab.tableHz-Math.sqrt(1-2*.01**2))<.00025,'sampled maximum agrees with damped displacement peak');comparisons++;
const nodal=m.simulateComparison({positionA:0,positionB:1});
assert.ok(nodal.tablePointResponseA.every(v=>v===0)&&nodal.tablePointResponseB.every(v=>v===0),'both endpoint nodes are exact nulls');comparisons++;
for(const invalid of [{tableHz:0},{tableModalMassKg:0},{position:-.1},{position:1.1},{tableDamping:0},{tableDamping:NaN}]){
 assert.throws(()=>m.emptyTablePointResponse({tableHz:21800,tableModalMassKg:1.4,position:.5,...invalid},21800),RangeError);comparisons++;
}
assert.throws(()=>m.emptyTablePointResponse({tableHz:21800,tableModalMassKg:1.4,position:.5},-1),RangeError);comparisons++;
const result={passed:true,producerSHA256:createHash('sha256').update(fs.readFileSync(new URL('../src/models.mjs',import.meta.url))).digest('hex'),numericalComparisons:comparisons,maxRelativeError:Math.max(...deviations.map(x=>x.relativeError)),deviations,limits:['No physical apparatus validated','Model agreement covers declared radial, coupled two-mode and empty-table point-response systems','Thick shell and anisotropic specimens require additional modeling']};
fs.writeFileSync(new URL('./producer-comparison.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,deviations:undefined},null,2));
