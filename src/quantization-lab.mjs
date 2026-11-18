import {quantize, exactDecimalFixedPoint, minimumBitsForPixelTolerance, storageComparison} from './quantization-engine.mjs';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const inputs = {
  position: $('#position'), bits: $('#bits'), width: $('#width'),
  entities: $('#entities'), tolerance: $('#tolerance'), updates: $('#updates')
};
const fmt = (value, digits = 9) => Number(value).toFixed(digits);
const number = (n) => n.toLocaleString('en-US', {maximumFractionDigits: 2});
const bytes = (n) => n >= 1024 ? (n / 1024).toFixed(2) + ' KiB' : n + ' B';

function updateRangeVisual(input) {
  const fraction = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
  input.style.setProperty('--track-fill', (100 * fraction).toFixed(2) + '%');
}

function svgLine(x1, y1, x2, y2, color, opacity, strokeWidth = 1) {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
    '" stroke="' + color + '" opacity="' + opacity + '" stroke-width="' + strokeWidth + '" />';
}

function renderSignal(x, result) {
  const left = 24, right = 576, y = 56;
  const scale = n => left + n * (right - left);
  const source = scale(x), restored = scale(result.decoded);
  const localSpan = Math.max(3 * result.step, 0.000003);
  const lo = Math.max(0, x - localSpan), hi = Math.min(1, x + localSpan);
  const localScale = n => left + ((n - lo) / (hi - lo)) * (right - left);
  let svg = svgLine(left, 25, right, 25, '#93b9d0', 0.65, 2);
  for(let i = 0; i <= 10; i++) svg += svgLine(left + i * (right - left) / 10, 17, left + i * (right - left) / 10, 33, '#bfd9ed', 0.2);
  svg += '<circle cx="' + source + '" cy="25" r="8" fill="#ebcd86" opacity=".9"/>';
  svg += '<circle cx="' + restored + '" cy="25" r="4.5" fill="#b7a1ff" stroke="white" stroke-width="1.5"/>';
  svg += svgLine(left, y + 18, right, y + 18, '#93b9d0', .7, 2);
  const start = Math.max(0, Math.ceil(lo * result.levels));
  const end = Math.min(result.levels, Math.floor(hi * result.levels));
  const stride = Math.max(1, Math.ceil((end - start) / 65));
  for(let i = start; i <= end; i += stride) {
    svg += svgLine(localScale(i / result.levels), y + 9, localScale(i / result.levels), y + 28, '#8cc8e7', .33);
  }
  const lx = localScale(x), ld = localScale(result.decoded);
  svg += svgLine(lx, y + 18, ld, y + 18, '#d6a9ff', .9, 5);
  svg += '<circle cx="' + lx + '" cy="' + (y + 18) + '" r="7.5" fill="#ebcd86"/>';
  svg += '<circle cx="' + ld + '" cy="' + (y + 18) + '" r="4.7" fill="#b7a1ff" stroke="white" stroke-width="1.2"/>';
  svg += '<text x="24" y="103" fill="#96b5ca" font-size="12">LOCAL ZOOM · ±3 QUANTIZATION STEPS</text>';
  $('#quant-visual').innerHTML = svg;
}

function renderComparison(x, width) {
  const bitsList = [8,12,16,17,24];
  const rows = bitsList.map(bits => ({bits, ...quantize(x,bits)}));
  const denominator = rows[0].maxError * width;
  $('#bit-comparison').replaceChildren(...rows.map(row => {
    const div = document.createElement('div');
    div.className = 'comparison-row';
    div.setAttribute('role','listitem');
    const actual = (row.error * width / denominator) * 100;
    const worst = (row.maxError * width / denominator) * 100;
    // bar widths encode absolute errors on one common scale, not separate scales.
    const info = document.createElement('div');
    info.className = 'comparison-top';
    const label = document.createElement('strong');
    label.textContent = row.bits + ' bit';
    const value = document.createElement('span');
    value.textContent = 'actual ' + fmt(row.error * width, 6) + ' px · max ' + fmt(row.maxError * width, 6);
    info.append(label,value);
    const track = document.createElement('div');
    track.className = 'compare-track';
    const worstBar = document.createElement('div');
    worstBar.className = 'compare-worst';
    worstBar.style.width = worst.toFixed(4) + '%';
    const actualBar = document.createElement('div');
    actualBar.className = 'compare-actual';
    actualBar.style.width = actual.toFixed(4) + '%';
    track.append(worstBar,actualBar);
    div.append(info, track);
    return div;
  }));
}

function renderTradeoff(width) {
  const entities = Number(inputs.entities.value);
  const tolerance = 10 ** Number(inputs.tolerance.value);
  const updates = Number(inputs.updates.value);
  const bits = minimumBitsForPixelTolerance(width, tolerance);
  const payload = storageComparison(entities, 2, bits, updates);
  const reduction = 100 * payload.savings / payload.float32Bytes;
  $('#entities-readout').textContent = number(entities);
  $('#tolerance-readout').textContent = tolerance.toPrecision(3) + ' px';
  $('#updates-readout').textContent = updates + ' / s';
  $('#recommended-bits').textContent = String(bits);
  $('#float-bytes').textContent = bytes(payload.float32Bytes);
  $('#packed-bytes').textContent = bytes(payload.idealPackedBytes);
  $('#savings').textContent = reduction.toFixed(1) + '%';
  $('#trade-fill').style.width = Math.min(100,Math.max(0,100-reduction)) + '%';
  $('#trade-explanation').textContent = 'At ' + width + ' px width, ' + bits +
    ' bits per coordinate guarantee at most ' + fmt(quantize(0,bits).maxError * width, 6) +
    ' px error. For ' + number(entities) + ' entities, 2 coordinates each, and ' +
    updates + ' full snapshots/s: ' + bytes(payload.payloadBytesPerSecond) +
    '/s ideally packed versus ' + bytes(payload.float32BytesPerSecond) +
    '/s using 32-bit floats. Measurements on real hardware may differ.';
}

function render() {
  Object.values(inputs).forEach(updateRangeVisual);
  const x = Number(inputs.position.value);
  const bits = Number(inputs.bits.value);
  const width = Number(inputs.width.value);
  const q = quantize(x, bits);
  const fixed = exactDecimalFixedPoint(x, 5);
  $('#position-readout').textContent = fmt(x, 5);
  $('#bits-readout').textContent = bits + ' bits';
  $('#width-readout').textContent = number(width) + ' px';
  $('#levels-readout').textContent = number(q.levels + 1) + ' levels';
  $('#q-value').textContent = number(q.encoded);
  $('#q-binary').textContent = '0b' + q.encoded.toString(2).padStart(bits, '0');
  $('#decoded').textContent = fmt(q.decoded, 9);
  $('#actual-px').textContent = fmt(q.error * width, 6) + ' px';
  $('#actual-norm').textContent = fmt(q.error, 9) + ' normalized';
  $('#worst-px').textContent = fmt(q.maxError * width, 6) + ' px';
  $('#fixed-int').textContent = number(fixed.encoded);
  $('#fixed-value').textContent = fmt(fixed.decoded, 5) + ' reconstructed';
  $$('.bit-preset').forEach(button => {
    const active = Number(button.dataset.bits) === bits;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderSignal(x, q);
  renderComparison(x,width);
  renderTradeoff(width);
}
Object.values(inputs).forEach(input => input.addEventListener('input', render));
$$('.bit-preset').forEach(button => button.addEventListener('click', () => {
  inputs.bits.value = button.dataset.bits;
  render();
}));
render();
