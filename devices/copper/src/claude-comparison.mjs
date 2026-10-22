const element = id => document.getElementById(id);
const number = (value, digits=3) => new Intl.NumberFormat('en-US', {maximumFractionDigits:digits}).format(value);

function frequencyPlot(rows) {
  const width=Math.max(300,Math.min(850,element('comparison-chart').clientWidth-18));
  const compact=width<650, left=compact?132:235, right=width-55, max=26000, height=65+rows.length*55;
  const x=f=>left+(right-left)*f/max;
  const axis=(compact?[0,10000,20000,25000]:[0,5000,10000,15000,20000,25000]).map(f=>`<line x1="${x(f)}" x2="${x(f)}" y1="15" y2="${height-40}" stroke="#c5cdbf"/><text x="${x(f)}" y="${height-16}" text-anchor="middle" fill="#627168" font-size="${compact?10:12}">${f/1000}</text>`).join('');
  const marks=rows.map(([label,f,color],i)=>{const y=40+i*55;return `<text x="15" y="${y+5}" fill="#163a35" font-size="13">${label}</text><line x1="${left}" x2="${x(f)}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="3"/><circle cx="${x(f)}" cy="${y}" r="6" fill="${color}"/><text x="${x(f)+10}" y="${y+5}" fill="#163a35" font-size="12">${number(f/1000,3)}</text>`;}).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Computed free mode frequencies in kilohertz. ${rows.map(([label,f])=>`${label}: ${number(f)} Hz`).join('; ')}"><title>Free sphere mode comparison; frequency in kHz</title>${axis}${marks}<text x="${(left+right)/2}" y="${height}" text-anchor="middle" fill="#627168" font-size="12">Frequency (kHz)</text></svg>`;
}

try {
  const response=await fetch('./research/claude-comparison.json');
  if(!response.ok)throw Error(`Comparison data unavailable (${response.status})`);
  const data=await response.json(), c=data.comparison;
  if(data.schema!=='fieldwork-claude-comparison/1'||!data.passed||!Object.values(c).every(Number.isFinite))throw Error('Comparison data failed validation');
  element('comparison-status').textContent=`${data.checks.length} numerical checks passed. The unmodified upstream script was rerun; all ${c.sourceModeCount} computed free frequencies reproduced. No physical experiment was performed.`;
  function show() {
    const matched=element('comparison-case').value==='claude';
    const exact=matched?c.claudeBreathingS0Hz:c.existingDefaultExactRadialShellHz;
    const membrane=matched?c.matchedMembraneHz:c.existingDefaultMembraneHz;
    const difference=membrane-exact;
    element('exact-hz').textContent=`${number(exact,2)} Hz`;
    element('membrane-hz').textContent=`${number(membrane,2)} Hz`;
    element('difference-hz').textContent=`${difference<0?'−':'+'}${number(Math.abs(difference),3)} Hz`;
    element('difference-note').textContent=`${number(difference/exact*1e6,2)} ppm. Numerical model difference, not a measured location effect.`;
    element('case-inputs').textContent=matched?'Outer diameter 88.9 mm · wall 1 mm · midsurface radius 43.95 mm · E 127.3478 GPa · ν 0.3460123 · ρ 8,930 kg/m³.':'Outer diameter 89.4 mm · wall 0.5 mm · midsurface radius 44.45 mm · E 123.5 GPa · ν 0.35 · ρ 8,960 kg/m³.';
    const rows=matched?[['S2 · deformation',c.claudeLowestS2Hz,'#244f43'],['T2 · twist',c.claudeT2Hz,'#627168'],['S0 · full radial',exact,'#a64e2d'],['S0 · membrane',membrane,'#244f43']]:[['S0 · full radial',exact,'#a64e2d'],['S0 · membrane',membrane,'#244f43']];
    element('comparison-chart').innerHTML=frequencyPlot(rows);
  }
  element('comparison-case').addEventListener('change',show);
  window.addEventListener('resize',show);
  show();
} catch(error) {
  element('comparison-status').textContent=`Interactive comparison unavailable: ${error.message}. The static review and original source links remain available.`;
  element('comparison-status').setAttribute('role','alert');
  element('comparison-case').disabled=true;
}
