import { deviceModels } from './models.mjs';
import { devices } from './catalog.mjs';
import { sources } from './sources.mjs';
import { BUILD_INFO } from './build-info.mjs';

const $ = (selector, scope = document) => scope.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const colors = ['#d2e99c', '#e7a97e', '#85bdc6', '#d7c8ed'];
const format = (value, precision = 3) => {
  if (!Number.isFinite(value)) return '—';
  if (value === 0 || Math.abs(value) < 1e-14) return '0';
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 1e5) return value.toExponential(2);
  return Number(value.toPrecision(precision)).toLocaleString('en-US', { maximumFractionDigits: 8 });
};
const asList = (value) => Array.isArray(value) ? value : value ? [value] : [];
const safeUrl = (url) => { try { const parsed = new URL(url, location.href); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '#'; } catch { return '#'; } };
const sourceById = new Map(sources.map((source) => [source.id, source]));
let currentDevice = 'rlc';
let parameters = {};
let currentResult = null;
let currentPreset = '';
let toastTimer;
let animationFrame;
let searchInProgress = false;
let lastSearch = null;
const defaultValues = (id) => Object.fromEntries(deviceModels[id].controls.map((control) => [control.key, control.default]));
const validControlValue = (control, value) => Number.isFinite(value) && value >= control.min && value <= control.max && Math.abs((value-control.min)/control.step-Math.round((value-control.min)/control.step)) < 1e-7;
const deviceData = (id) => devices.find((device) => device.id === id) || { id, title: deviceModels[id].title, description: deviceModels[id].description };
const currentModel = () => deviceModels[currentDevice];
const notify = (message) => { clearTimeout(toastTimer); const el = $('#toast'); el.textContent = message; el.classList.add('visible'); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500); };

function restoreLocation() {
  const query = new URLSearchParams(location.search);
  if (Object.hasOwn(deviceModels, query.get('device'))) currentDevice = query.get('device');
  parameters = defaultValues(currentDevice);
  for (const control of currentModel().controls) {
    if (!query.has(control.key)) continue;
    const value = Number(query.get(control.key));
    if (validControlValue(control,value)) parameters[control.key] = value;
  }
}
function sourceLinks(ids) {
  const found = asList(ids).map((id) => sourceById.get(id)).filter(Boolean);
  return found.length ? found.map((source) => `<div class="source-inline"><a href="${escape(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ↗</a></div>`).join('') : '<p class="source-read-scope">See the source register for model foundations and limits.</p>';
}
function renderSelector() {
  $('#device-selector').innerHTML = Object.keys(deviceModels).map((id, index) => {
    const device = deviceData(id);
    return `<button class="device-tab" id="device-tab-${id}" role="tab" aria-selected="${id === currentDevice}" aria-controls="bench" tabindex="${id === currentDevice ? '0' : '-1'}" data-device="${id}"><span class="tab-number">0${index + 1}</span><span><strong>${escape(device.title)}</strong><small>${escape(device.channel || ({ rlc: 'ELECTROMAGNETIC', array: 'ACOUSTIC', absorber: 'MECHANICAL' })[id])}</small></span><span class="tab-arrow" aria-hidden="true">↗</span></button>`;
  }).join('');
}
function presetOptions(model) {
  const groups = [...new Set(model.presets.map((preset) => preset.group || 'Experiment presets'))];
  return '<option value="custom">Custom parameters</option>' + groups.map((group) => `<optgroup label="${escape(group)}">${model.presets.filter((preset) => (preset.group || 'Experiment presets') === group).map((preset) => `<option value="${escape(preset.id)}"${currentPreset === preset.id ? ' selected' : ''}>${escape(preset.label)}</option>`).join('')}</optgroup>`).join('');
}
function renderBench() {
  const device = deviceData(currentDevice);
  const model = currentModel();
  $('#bench').setAttribute('aria-labelledby', `device-tab-${currentDevice}`);
  $('#bench').innerHTML = `<div class="bench-intro"><div><h3>${escape(device.subtitle || device.title)}</h3><p>${escape(device.description || model.description)}</p></div><span class="evidence-tag">${escape(device.evidence || 'ESTABLISHED MODEL · SIMULATED')}</span></div><div class="bench-grid"><aside class="control-panel" aria-label="Simulation parameters"><div class="control-heading"><h4>EXPERIMENT CONDITIONS</h4><button class="text-button" data-action="reset">Reset all</button></div><label class="preset-label" for="experiment-preset">Start from a preset</label><select id="experiment-preset" class="preset-select">${presetOptions(model)}</select><p class="preset-help">A named model configuration, not a validated hardware recipe.</p><div class="control-fields">${model.controls.map((control) => `<div class="control-field"><div class="control-label-row"><label for="range-${control.key}">${escape(control.label)}</label><div class="control-value"><input id="number-${control.key}" type="number" min="${control.min}" max="${control.max}" step="${control.step}" value="${parameters[control.key]}" data-control="${control.key}" aria-label="${escape(control.label)} numeric value${control.unit ? ` in ${escape(control.unit)}` : ''}"/><span>${escape(control.unit)}</span></div></div><input id="range-${control.key}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${parameters[control.key]}" data-control="${control.key}"/><div class="control-range"><span>${format(control.min)}</span><span>${format(control.max)} ${escape(control.unit)}</span></div></div>`).join('')}</div><p class="controls-note">${currentDevice === 'array' ? '8 × 8 ideal point sources. All phases share the same deterministic error seed. Phase bits = 0 means continuous phase.' : 'Steady-state linear response. Voltage, current, force, and displacement amplitudes use RMS conventions where applicable.'}</p></aside><div class="visual-panel"><div class="plot-header"><h4>${({ rlc: 'FREQUENCY RESPONSE', array: 'FOCUS & FIELD', absorber: 'RESPONSE COMPARISON' })[currentDevice]}</h4><span class="simulation-label">● MODEL OUTPUT / LIVE</span></div><div id="plot-region"></div><div id="model-metrics" class="model-metrics" aria-label="Calculated results"></div><div class="bench-actions"><div class="export-buttons"><button class="small-button" data-action="csv">Export CSV ↓</button><button class="small-button" data-action="json">Export JSON ↓</button></div><button class="share-button" data-action="share">Copy this experiment ↗</button></div></div></div>${currentDevice === 'absorber' ? `<div class="search-panel"><div><h4>Search a bounded design space</h4><p>Compare a finite grid of absorber tuning and damping values against an explicit response objective. This is a deterministic numerical search.</p><p id="search-output" class="search-output" role="status" aria-live="polite"></p></div><button data-action="design-search">Run design search ↗</button></div>` : ''}<div class="bench-details"><details><summary>Equations &amp; assumptions</summary><p class="formula">${escape(device.formula || '')}</p><ul>${asList(device.assumptions).map((item) => `<li>${escape(item)}</li>`).join('')}</ul></details><details><summary>What this model leaves out</summary><ul>${asList(device.limitations).map((item) => `<li>${escape(item)}</li>`).join('')}</ul></details><details><summary>Sources &amp; setup</summary>${sourceLinks(device.sourceIds)}<ul>${asList(device.setup).map((item) => `<li>${escape(item)}</li>`).join('')}</ul></details></div>`;
  updateSimulation();
}
function plotSvg(series, xLabel, yLabel, selectedX = null) {
  const points = series.flatMap((entry) => entry.points).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return '<p class="chart-empty">No finite samples are available for this configuration.</p>';
  const width = 640, height = 310;
  const margin = { left: 64, right: 20, top: 48, bottom: 51 };
  let xMin = Math.min(...points.map((point) => point.x));
  let xMax = Math.max(...points.map((point) => point.x));
  const yMin = Math.min(0, ...points.map((point) => point.y));
  let yMax = Math.max(...points.map((point) => point.y));
  if (xMin === xMax) { xMin -= .5; xMax += .5; }
  if (yMax === yMin) yMax = yMin + 1;
  yMax += (yMax - yMin) * .08;
  const plotW = width - margin.left - margin.right, plotH = height - margin.top - margin.bottom;
  const sx = (x) => margin.left + (x - xMin) / (xMax - xMin) * plotW;
  const sy = (y) => margin.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;
  const ticks = Array.from({ length: 5 }, (_, index) => index / 4);
  const yTicks = ticks.map((fraction) => { const y = yMin + fraction * (yMax - yMin); return `<line x1="${margin.left}" y1="${sy(y)}" x2="${width - margin.right}" y2="${sy(y)}" stroke="#3d514a" stroke-width="1"/><text x="${margin.left - 11}" y="${sy(y) + 3}" text-anchor="end">${format(y)}</text>`; }).join('');
  const xTicks = ticks.map((fraction) => { const x = xMin + fraction * (xMax - xMin); return `<text x="${sx(x)}" y="${height - margin.bottom + 22}" text-anchor="middle">${format(x)}</text>`; }).join('');
  const paths = series.map((entry, index) => `<path d="${entry.points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)).map((point, pointIndex) => `${pointIndex ? 'L' : 'M'}${sx(point.x).toFixed(2)},${sy(point.y).toFixed(2)}`).join(' ')}" fill="none" stroke="${colors[index % colors.length]}" stroke-width="${index === 0 ? 2.4 : 1.6}"${index === 1 ? ' stroke-dasharray="5 4"' : ''} vector-effect="non-scaling-stroke"/>`).join('');
  const selected = Number.isFinite(selectedX) && selectedX >= xMin && selectedX <= xMax ? `<line x1="${sx(selectedX)}" y1="${margin.top}" x2="${sx(selectedX)}" y2="${height - margin.bottom}" stroke="#dce9dd" stroke-width="1" stroke-dasharray="2 5" opacity=".65"/><text x="${Math.max(margin.left + 36, Math.min(width - margin.right - 36, sx(selectedX)))}" y="${margin.top - 10}" text-anchor="middle">SET ${format(selectedX)}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(yLabel)} versus ${escape(xLabel)}. ${series.map((entry) => escape(entry.name)).join(', ')}. Numerical samples are available in the CSV and JSON exports."><title>${escape(yLabel)} versus ${escape(xLabel)}</title>${yTicks}${xTicks}${selected}${paths}<text class="axis-label" x="${margin.left + plotW / 2}" y="${height - 4}" text-anchor="middle">${escape(xLabel)}</text><text class="axis-label" x="${margin.left}" y="13">${escape(yLabel)}</text></svg><div class="chart-legend">${series.map((entry, index) => `<span><i class="legend-line" style="--series-color:${colors[index % colors.length]}"></i>${escape(entry.name)}</span>`).join('')}</div>`;
}
function drawMap(result) {
  const canvas = $('#field-map');
  if (!canvas || !result.map) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const map = result.map;
  const cellScale = 5;
  const pad = { left: 47, right: 17, top: 22, bottom: 35 };
  canvas.width = map.width * cellScale + pad.left + pad.right;
  canvas.height = map.height * cellScale + pad.top + pad.bottom;
  const stops = [[18,44,48], [44,119,115], [155,200,151], [255,222,137]];
  const color = (value) => {
    const scaled = Math.min(1, Math.max(0, value)) * 3;
    const index = Math.min(2, Math.floor(scaled));
    const fraction = scaled - index;
    return `rgb(${stops[index].map((v, channel) => Math.round(v + (stops[index + 1][channel] - v) * fraction)).join(',')})`;
  };
  context.fillStyle = '#1d302e'; context.fillRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < map.height; row++) for (let col = 0; col < map.width; col++) {
    context.fillStyle = color(map.values[row * map.width + col]);
    context.fillRect(pad.left + col * cellScale, pad.top + (map.height - 1 - row) * cellScale, cellScale, cellScale);
  }
  context.font = '12px ui-monospace, monospace'; context.fillStyle = '#c7d4c7'; context.textAlign = 'center';
  const mapW = map.width * cellScale, mapH = map.height * cellScale;
  [-1, 0, 1].forEach((sign) => { const x = (sign + 1) / 2; const value = (map.xMin + (map.xMax - map.xMin) * x) * 1000; context.fillText(format(value), pad.left + mapW * x, pad.top + mapH + 18); });
  context.fillText('x (mm)', pad.left + mapW / 2, canvas.height - 2);
  context.textAlign = 'right';
  [0, .5, 1].forEach((fraction) => { const value = (map.yMin + (map.yMax - map.yMin) * fraction) * 1000; context.fillText(format(value), pad.left - 7, pad.top + mapH * (1 - fraction) + 4); });
  context.textAlign = 'left'; context.fillText('z (mm)', 3, 13);
  const targetX = pad.left + (result.parameters.targetXM - map.xMin) / (map.xMax - map.xMin) * mapW;
  const targetY = pad.top + (1 - (result.parameters.targetZM - map.yMin) / (map.yMax - map.yMin)) * mapH;
  context.strokeStyle = '#fffaf0'; context.lineWidth = 1.5; context.beginPath(); context.arc(targetX, targetY, 7, 0, Math.PI * 2); context.moveTo(targetX - 11, targetY); context.lineTo(targetX + 11, targetY); context.moveTo(targetX, targetY - 11); context.lineTo(targetX, targetY + 11); context.stroke();
}
function updateSimulation() {
  try {
    const result = currentModel().simulate(parameters);
    currentResult = result;
    const selected = currentDevice === 'rlc' ? parameters.frequencyHz / 1000 : currentDevice === 'absorber' ? parameters.frequencyHz : parameters.targetXM * 1000;
    const chart = `<div class="chart-shell" tabindex="0" aria-label="Scrollable response chart">${plotSvg(result.series, result.xLabel, result.yLabel, selected)}<p class="chart-pan-hint">Swipe or use arrow keys to inspect the full plot.</p></div>`;
    if (result.map) {
      const max = Math.max(...result.map.values);
      $('#plot-region').innerHTML = `<div class="map-layout"><div class="map-container"><canvas id="field-map" class="field-map" role="img" aria-label="Cross-sectional pressure-squared proxy map of the configured array; target marked with a white cross. Exact map samples can be exported as CSV or JSON."></canvas><div class="map-scale"><span>0</span><i></i><span>≥1</span></div><p class="map-caption">Relative pressure² / ideal target. The color scale clips at 1; actual map maximum: ${format(max)}. White cross: configured target.</p></div>${chart}</div><p class="plot-description">Free-space point-source model, y = 0 slice. This is a normalized pressure-squared proxy, not calibrated sound pressure, local energy flux, force, or a levitation prediction.</p>`;
      drawMap(result);
    } else $('#plot-region').innerHTML = chart + `<p class="plot-description">${currentDevice === 'rlc' ? 'The dashed vertical line marks the selected drive frequency. Power is supplied by the external source; winding losses and load power are counted separately.' : 'The dashed vertical line marks the selected drive frequency. A passive absorber redistributes the response: improvement at one frequency can come with larger motion elsewhere.'}</p>`;
    $('#model-metrics').innerHTML = result.metrics.map((metric) => `<div class="metric"><span class="metric-label">${escape(metric.label)}</span><span class="metric-value">${format(metric.value)}<span class="metric-unit">${escape(metric.unit)}</span></span>${metric.detail ? `<p class="metric-detail">${escape(metric.detail)}</p>` : ''}</div>`).join('');
  } catch (error) {
    currentResult = null;
    $('#plot-region').innerHTML = `<p class="error-message">This configuration could not be simulated: ${escape(error.message)}. Restore the defaults to continue.</p>`;
    $('#model-metrics').innerHTML = '';
  }
}
function setDevice(id, scroll = false) {
  if (!Object.hasOwn(deviceModels, id)) return;
  currentDevice = id; parameters = defaultValues(id); currentPreset = ''; lastSearch = null;
  renderSelector(); renderBench();
  if (scroll) $('#workbench').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
function renderResearchStrip() {
  const recent = sources.filter((source) => /openai|anthropic|claude/i.test(`${source.publisher} ${source.title} ${asList(source.tags).join(' ')}`)).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 2);
  $('#recent-research').innerHTML = recent.length ? recent.map((source) => `<a class="recent-source" href="${escape(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer"><span class="source-meta">${escape(source.publisher)} / ${escape(source.date || 'DATE NOT VERIFIED')}</span><strong>${escape(source.title)}</strong><span aria-hidden="true">↗</span></a>`).join('') : '<p class="empty-state">Read the selected research methods and source limits in the library below.</p>';
}
function renderHypotheses() {
  $('#hypotheses').innerHTML = devices.flatMap((device) => asList(device.hypotheses).map((hypothesis) => `<article class="hypothesis"><p class="eyebrow">${escape(device.channel || device.title)} / PROPOSED TEST</p><h3>${escape(hypothesis.title)}</h3><dl><dt>USE CASE</dt><dd>${escape(hypothesis.useCase)}</dd><dt>PREDICTION</dt><dd>${escape(hypothesis.prediction)}</dd><dt>CONTROL</dt><dd>${escape(hypothesis.control)}</dd><dt>FALSIFIER</dt><dd>${escape(hypothesis.falsifier)}</dd></dl><button class="hypothesis-link" data-open-device="${escape(device.id)}">Explore this model ↗</button></article>`)).join('');
}
function renderConnections() {
  $('#connections-list').innerHTML = devices.flatMap((device) => asList(device.connections).map((connection) => `<article class="connection"><div><strong>${escape(connection.from)}</strong><span class="connection-type">${escape(connection.type || 'CONCEPTUAL RELATIONSHIP')}</span></div><span class="connection-arrow" aria-hidden="true">→</span><strong>${escape(connection.to)}</strong><p>${escape(connection.note)}</p></article>`)).join('');
}
function renderSourceFilters() {
  const kinds = [...new Set(sources.map((source) => source.kind || 'Other'))].sort();
  $('#source-kind').innerHTML = '<option value="all">All source types</option>' + kinds.map((kind) => `<option value="${escape(kind)}">${escape(kind)}</option>`).join('');
}
function renderSources() {
  const term = $('#source-search').value.toLowerCase().trim();
  const kind = $('#source-kind').value;
  const selected = sources.filter((source) => (kind === 'all' || (source.kind || 'Other') === kind) && (!term || [source.title, source.publisher, source.claim, source.limit, source.application, ...asList(source.tags)].join(' ').toLowerCase().includes(term)));
  $('#source-count').textContent = `${selected.length} / ${sources.length}`;
  $('#source-list').innerHTML = selected.length ? selected.map((source) => `<article class="source-row" id="source-${escape(source.id)}"><div class="source-meta"><strong>${escape(source.kind || 'Source')}</strong><span>${escape(source.publisher || '')}</span><span>${escape(source.date || 'Date not verified')}</span></div><div class="source-content"><h3><a href="${escape(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ↗</a></h3><p>${escape(source.claim)}</p>${source.limit ? `<p class="source-limit"><strong>Limit:</strong> ${escape(source.limit)}</p>` : ''}<details class="source-details"><summary>Reading scope &amp; application</summary><p><strong>Examined:</strong> ${escape(source.readScope || 'See the original source for full context.')}</p><p><strong>Application:</strong> ${escape(source.application || 'Context for evaluating the device concepts.')}</p>${asList(source.tags).length ? `<p class="source-read-scope">${asList(source.tags).map(escape).join(' · ')}</p>` : ''}</details></div><span class="source-badge">${escape(source.status || 'SOURCE RECORD')}</span></article>`).join('') : '<p class="empty-state">No sources match these filters. Try a broader term or choose all source types.</p>';
}
function downloadFile(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function exportResult(type) {
  if (!currentResult) { notify('Restore a valid configuration before exporting.'); return; }
  const result = currentResult;
  if (type === 'json') downloadFile(`fieldwork-${currentDevice}.json`, JSON.stringify({ site: 'Fieldwork / Device Observatory', modelVersion: '1', description: 'Deterministic simulation output; not a hardware measurement.', build: BUILD_INFO, exportedAt: new Date().toISOString(), device: deviceData(currentDevice), result }, null, 2), 'application/json');
  else {
    const rows = [['type', 'name', 'x', 'y', 'value', 'unit_or_axis']];
    for (const [name, value] of Object.entries(result.parameters)) rows.push(['parameter', name, '', '', value, 'SI unless parameter name states otherwise']);
    for (const metric of result.metrics) rows.push(['metric', metric.label, '', '', metric.value, metric.unit]);
    for (const series of result.series) for (const point of series.points) rows.push(['series', series.name, point.x, point.y, '', `${result.xLabel}; ${result.yLabel}`]);
    if (result.axialSeries) for (const point of result.axialSeries) rows.push(['axial-series', 'Configured phases at target x', point.x, point.y, '', 'Depth z (mm); relative pressure² / ideal target']);
    if (result.map) {
      const map = result.map;
      for (let row = 0; row < map.height; row++) for (let col = 0; col < map.width; col++) rows.push(['map', 'Relative pressure² / ideal target', map.xMin + (map.xMax - map.xMin) * col / (map.width - 1), map.yMin + (map.yMax - map.yMin) * row / (map.height - 1), map.values[row * map.width + col], 'x (m); z (m); dimensionless pressure² proxy']);
    }
    downloadFile(`fieldwork-${currentDevice}.csv`, rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n', 'text/csv;charset=utf-8');
  }
  notify(`${type.toUpperCase()} exported with model parameters and numerical outputs.`);
}
async function shareExperiment() {
  const url = new URL(location.href); url.search = ''; url.hash = 'workbench';
  url.searchParams.set('device', currentDevice);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, String(value));
  try { await navigator.clipboard.writeText(url.href); notify('Experiment link copied.'); }
  catch { history.replaceState(null, '', url); notify('Experiment URL is ready in the address bar.'); }
}
async function designSearch() {
  if (searchInProgress || currentDevice !== 'absorber') return;
  const button = $('[data-action="design-search"]');
  const output = $('#search-output');
  searchInProgress = true; button.disabled = true; lastSearch = null;
  output.textContent = 'Comparing candidates within fixed parameter bounds…';
  const initialParameters = { ...parameters };
  try {
    const { searchAbsorberDesign } = await import('./search.mjs');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const result = searchAbsorberDesign(initialParameters);
    if (currentDevice !== 'absorber' || !$('#search-output')) return;
    lastSearch = result;
    const low = result.frequencyBandHz[0], high = result.frequencyBandHz[1];
    const changed = Object.keys(initialParameters).some((key) => parameters[key] !== initialParameters[key]);
    $('#search-output').innerHTML = `<span class="search-summary"><strong>${result.candidatesEvaluated} candidates · ${format(low)}–${format(high)} Hz</strong><span>${escape(result.objective)}</span><span>Worst held-out RMS motion: <strong>${format(result.baseline.validationWorstMm)} mm → ${format(result.best.validationWorstMm)} mm</strong>. ${result.heldOutImprovement ? 'The candidate improved this sampled comparison.' : 'No improvement over the baseline on held-out samples.'}</span><span>Selected tuning ratio: ${format(result.best.parameters.tuningRatio)}; damping ratio: ${format(result.best.parameters.dampingRatioAbsorber)}. ${result.trainingFrequencyHz.length} training frequencies; ${result.validationFrequencyHz.length} interleaved held-out frequencies.</span><span>${changed ? 'The controls changed during this search. ' : ''}Current controls are unchanged. Applying the candidate restores the input conditions used for this search.</span><span class="search-limits">${result.limits.map(escape).join(' ')}</span></span><span class="search-result-actions"><button class="small-button" data-action="apply-search">Apply candidate</button><button class="small-button" data-action="export-search">Export search JSON ↓</button></span>`;
  } catch (error) { if ($('#search-output')) $('#search-output').textContent = `Search could not run: ${error.message}`; }
  finally { searchInProgress = false; if ($('[data-action="design-search"]')) $('[data-action="design-search"]').disabled = false; }
}
function applySearch() {
  if (!lastSearch || currentDevice !== 'absorber') return;
  parameters = Object.fromEntries(currentModel().controls.map((control) => [control.key, lastSearch.best.parameters[control.key]]));
  currentPreset = ''; $('#experiment-preset').value = 'custom'; syncControlValues(); updateSimulation();
  notify('Search candidate applied. The original comparison remains in the search export.');
}
function exportSearch() {
  if (!lastSearch) return;
  downloadFile('fieldwork-absorber-search.json', JSON.stringify({ site: 'Fieldwork / Device Observatory', modelVersion: '1', build: BUILD_INFO, exportedAt: new Date().toISOString(), description: 'Bounded deterministic search, not an AI call or hardware measurement.', result: lastSearch }, null, 2), 'application/json');
  notify('Search record exported with all trials and held-out comparisons.');
}
function syncControlValues() {
  for (const control of currentModel().controls) {
    $(`#range-${control.key}`).value = parameters[control.key];
    $(`#number-${control.key}`).value = parameters[control.key];
  }
}

document.addEventListener('click', (event) => {
  const deviceButton = event.target.closest('[data-device]');
  if (deviceButton) { setDevice(deviceButton.dataset.device); $(`#device-tab-${currentDevice}`).focus(); return; }
  const hypothesisButton = event.target.closest('[data-open-device]');
  if (hypothesisButton) { setDevice(hypothesisButton.dataset.openDevice, true); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'reset') { parameters = defaultValues(currentDevice); currentPreset = ''; lastSearch = null; renderBench(); notify('Default conditions restored.'); }
  if (action === 'csv' || action === 'json') exportResult(action);
  if (action === 'share') shareExperiment();
  if (action === 'design-search') designSearch();
  if (action === 'apply-search') applySearch();
  if (action === 'export-search') exportSearch();
});
document.addEventListener('input', (event) => {
  if (event.target.id === 'source-search') { renderSources(); return; }
  const key = event.target.dataset.control;
  if (!key) return;
  const control = currentModel().controls.find((item) => item.key === key);
  if (!control || event.target.value === '') return;
  const value = Number(event.target.value);
  if (!validControlValue(control,value) || !event.target.validity.valid) return;
  parameters[key] = value; currentPreset = ''; $('#experiment-preset').value = 'custom';
  const partner = $(`#${event.target.type === 'range' ? 'number' : 'range'}-${key}`); partner.value = value;
  if ($('#search-output')) { $('#search-output').textContent = ''; lastSearch = null; }
  cancelAnimationFrame(animationFrame); animationFrame = requestAnimationFrame(updateSimulation);
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'source-kind') renderSources();
  if (event.target.id === 'experiment-preset') {
    const preset = currentModel().presets.find((item) => item.id === event.target.value);
    if (!preset) return;
    parameters = { ...defaultValues(currentDevice), ...Object.fromEntries(currentModel().controls.filter((control) => Object.hasOwn(preset.values, control.key)).map((control) => [control.key, preset.values[control.key]])) };
    currentPreset = preset.id; syncControlValues(); updateSimulation();
    if ($('#search-output')) { $('#search-output').textContent = ''; lastSearch = null; }
  }
  const key = event.target.dataset.control;
  if (key && event.target.type === 'number') { const control = currentModel().controls.find((item) => item.key === key); if (control && !event.target.validity.valid) { event.target.value = parameters[key]; notify('Enter a value within the displayed bounds.'); } }
});
$('#device-selector').addEventListener('keydown', (event) => {
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const ids = Object.keys(deviceModels); const index = ids.indexOf(currentDevice);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + ids.length) % ids.length;
  setDevice(ids[next]); $(`#device-tab-${currentDevice}`).focus();
});
restoreLocation(); renderSelector(); renderBench(); renderResearchStrip(); renderHypotheses(); renderConnections(); renderSourceFilters(); renderSources();
