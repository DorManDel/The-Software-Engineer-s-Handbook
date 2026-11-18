import {FIELDS,LAYOUTS,createDataset,locate,describeCells,accessTrace,structOverlay,scanDataset,median} from './memory-layout-engine.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const modelInputs = {count:$('#fish-count'),blockSize:$('#block-size'),pattern:$('#access-pattern')};
const benchInputs = {size:$('#bench-size'),pattern:$('#bench-pattern'),repeats:$('#bench-repeats')};
const labels={aos:'AoS',soa:'SoA',aosoa:'AoSoA'};
let layout='aos', model=null, steps=[], currentStep=-1;
let latestBenchmark=null;
const num=n=>n.toLocaleString('en-US',{maximumFractionDigits:3});
const hex=n=>'+0x'+n.toString(16).toUpperCase().padStart(4,'0');
function elt(tag,className='',content=''){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(content!==null)node.textContent=content;
  return node;
}
function rangeTrack(input) {
 const pct=(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100;
 input.style.setProperty('--track-fill',pct.toFixed(2)+'%');
}
function createCell(cell) {
 const key=cell.bufferIndex+':'+cell.elementIndex;
 const active=currentStep>=0&&steps[currentStep].bufferIndex+':'+steps[currentStep].elementIndex===key;
 const visited=steps.slice(0,Math.max(0,currentStep+1)).some(s=>s.bufferIndex+':'+s.elementIndex===key);
 const node=elt('div','memory-cell-slot type-'+cell.field+(cell.padding?' is-padding':'')+(visited?' is-visited':'')+(active?' is-current':''));
 node.title=(cell.padding?'Unused padding':'Fish '+cell.entity+' · '+cell.field)+' / '+cell.bufferId+' / byte '+hex(cell.byteOffset);
 node.append(elt('strong','cell-label',cell.padding?'PAD':'F'+cell.entity+' · '+cell.field),
             elt('small','cell-offset',hex(cell.byteOffset)),
             elt('small','cell-mini','4 bytes'));
 return node;
}
function renderMap() {
 const host=$('#memory-map');
 host.replaceChildren();
 for(const buffer of describeCells(model)){
  const panel=elt('div','buffer-panel');
  const heading=elt('div','buffer-heading');
  heading.append(elt('strong','', 'Buffer: '+buffer.id),
                 elt('span','',buffer.byteLength+' bytes · offsets start at 0'));
  const items=elt('div','buffer-cells');
  items.append(...buffer.cells.map(createCell));
  panel.append(heading,items);
  host.append(panel);
 }
}
function renderAccessTrace() {
 const total=steps.length;
 $('#trace-step-count').textContent=(currentStep+1)+' / '+total+' field reads';
 $('#trace-step').disabled=currentStep>=total-1;
 if(currentStep<0) {
   $('#trace-current').textContent='Press Step to inspect the next access';
   $('#trace-description').textContent='Watch which Float32 slot is read and where its byte offset lives.';
 }else{
   const event=steps[currentStep];
   $('#trace-current').textContent='Fish '+event.entity+' · '+event.field+' → Buffer '+event.bufferId+' '+hex(event.byteOffset);
   $('#trace-description').textContent='Read '+(currentStep+1)+' of '+total+' · exact byte offset within '+event.bufferId;
 }
 const host=$('#trace-list'); host.replaceChildren();
 for(let i=0;i<Math.min(12,total);i++){
   const event=steps[i];
   const node=elt('div','trace-event'+(i<currentStep?' done':'')+(i===currentStep?' active':''));
   node.append(elt('strong','',String(i+1)+'. F'+event.entity+' '+event.field),elt('span','',event.bufferId+' '+hex(event.byteOffset)));
   host.append(node);
 }
}
function renderInsights() {
 const pattern=modelInputs.pattern.value;
 const statements={
   aos:'AoS keeps each fish’s x, y and health in three consecutive 4-byte cells. In this demo they share one ArrayBuffer. It is convenient when inspecting whole records; x-only scans also step over other fields.',
   soa:'SoA stores x[], y[] and health[] in three separate ArrayBuffers. Scanning one field touches contiguous 4-byte cells within one buffer. Allocation and keeping parallel arrays synchronized are additional design concerns.',
   aosoa:'AoSoA stores fixed-size groups: first a block of x values, then y, then health. It combines short contiguous field runs with grouped records. The final group may contain unused slots, and block-size tuning matters.'
 };
 const workload={
   positions:'This workload reads two fields per entity. SoA may suit contiguous field-oriented iteration, but no real cache performance is established until it is measured.',
   entity:'Reading an entire entity touches x, y and health. AoS puts them adjacent; SoA requires reads from distinct buffers. In a browser we cannot infer exact cache hits from these offsets.',
   health:'Health-only scanning traverses every third Float32 in AoS, one contiguous buffer in SoA and health segments in AoSoA.'
 };
 const target=$('#layout-insights');target.replaceChildren();
 const heading=elt('strong','',labels[layout]+' · Why it looks like this');
 target.append(heading,elt('p','',statements[layout]),elt('p','',workload[pattern]));
 const concise={aos:'1 buffer · interleaved records',soa:'3 separate buffers · columns',aosoa:'1 buffer · fixed-size blocks'};
 $('#layout-explanation-short').textContent=concise[layout];
 $('#layout-explanation').textContent='These offsets are exact for the explicitly allocated Float32Arrays in this lab. They are relative to each ArrayBuffer (not hardware addresses). '+(layout==='aosoa'?'Block slots that do not correspond to a fish are explicitly allocated padding.':'No padding is added for these three Float32 fields.');
}
function renderModel() {
 const n=Number(modelInputs.count.value),b=Number(modelInputs.blockSize.value);
 model=createDataset(layout,n,b);
 steps=accessTrace(model,modelInputs.pattern.value);
 currentStep=-1;
 Object.values(modelInputs).filter(v=>v.type==='range').forEach(rangeTrack);
 $('#fish-count-out').textContent=n;
 $('#block-size-out').textContent=b;
 $('#logical-byte-count').textContent=model.logicalBytes+' B';
 $('#buffer-count').textContent=model.buffers.length;
 $('#allocated-byte-count').textContent=model.allocatedBytes+' B';
 $('#padding-byte-count').textContent=model.paddingBytes+' B';
 $$('.layout-choice').forEach(button=>{
   const active=button.dataset.layout===layout;
   button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
 });
 renderMap();renderAccessTrace();renderInsights();
}
function renderOverlay() {
 const overlay=structOverlay();
 const host=$('#struct-bytes');host.replaceChildren();
 for(const byte of overlay.bytes) {
   const cell=elt('div','struct-byte');
   cell.dataset.field=byte.field;
   cell.title='byte +'+byte.offset+' · '+byte.field;
   cell.append(elt('small','',hex(byte.offset)),elt('strong','',byte.hex));
   host.append(cell);
 }
 const readouts=$('#struct-readouts');readouts.replaceChildren();
 for(const [name,value,offset] of [['x',overlay.decoded.x,0],['hp',overlay.decoded.health,4],['y',overlay.decoded.y,8]]){
   const node=elt('div');
   node.append(elt('small','',name+' @ '+hex(offset)),elt('strong','',String(value)));
   readouts.append(node);
 }
}
for(const input of Object.values(modelInputs))input.addEventListener('input',renderModel);
$$('.layout-choice').forEach(button=>button.addEventListener('click',()=>{layout=button.dataset.layout;renderModel();}));
$('#trace-reset').addEventListener('click',()=>{currentStep=-1;renderMap();renderAccessTrace();});
$('#trace-step').addEventListener('click',()=>{if(currentStep<steps.length-1){currentStep++;renderMap();renderAccessTrace();}});
for(const input of Object.values(benchInputs))input.addEventListener('input',()=>{
 Object.values(benchInputs).filter(x=>x.type==='range').forEach(rangeTrack);
 $('#bench-size-out').textContent=num(Number(benchInputs.size.value));
 $('#bench-repeats-out').textContent=benchInputs.repeats.value;
 $('#benchmark-status').textContent='Settings changed. Re-run to measure this workload.';
});
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
async function runBenchmark() {
 const button=$('#run-benchmark'),status=$('#benchmark-status');
 button.disabled=true;status.textContent='Preparing buffers and warming up…';
 const size=Number(benchInputs.size.value),pattern=benchInputs.pattern.value,repeats=Number(benchInputs.repeats.value);
 try{
  const datasets=LAYOUTS.map(kind=>createDataset(kind,size,4));
  const reference=scanDataset(datasets[0],pattern,1);
  for(const ds of datasets){
    const check=scanDataset(ds,pattern,1);
    if(Math.abs(check-reference)>Math.max(1,Math.abs(reference))*1e-9)throw new Error('Non-equivalent results: benchmark cancelled.');
    scanDataset(ds,pattern,10);scanDataset(ds,pattern,10);
  }
  const runs=5,samples=LAYOUTS.map(()=>[]),checks=LAYOUTS.map(()=>[]);
  for(let trial=0;trial<runs;trial++) {
    // Rotate candidate order to reduce (not eliminate) warm-cache/thermal bias.
    for(let advance=0;advance<datasets.length;advance++){
      const index=(trial+advance)%datasets.length;
      await nextFrame();
      const start=performance.now();
      const sum=scanDataset(datasets[index],pattern,repeats);
      const elapsed=performance.now()-start;
      if(!Number.isFinite(elapsed)||elapsed<0)throw new Error('Timer returned an invalid duration');
      samples[index].push(elapsed/repeats);
      checks[index].push(sum);
    }
    status.textContent='Measuring… '+(trial+1)+' / '+runs+' samples per layout';
  }
  const results=LAYOUTS.map((kind,i)=>({
    layout:kind,medianMsPerScan:median(samples[i]),samplesMsPerScan:samples[i],
    checksum:checks[i][0],allocatedBytes:datasets[i].allocatedBytes,paddingBytes:datasets[i].paddingBytes
  }));
  for(const row of results){
    const expected=reference*repeats;
    if(Math.abs(row.checksum-expected)>Math.max(1,Math.abs(expected))*1e-9)throw new Error('Checksum mismatch: benchmark cancelled.');
  }
  const best=Math.min(...results.map(row=>row.medianMsPerScan));
  const host=$('#benchmark-rows');host.replaceChildren();
  for(const row of results) {
    const line=elt('tr');
    line.append(elt('td','',labels[row.layout]),elt('td',row.medianMsPerScan===best?'fastest':'',row.medianMsPerScan.toFixed(4)+' ms'),
      elt('td','',row.samplesMsPerScan.length+' (median)'),elt('td','',num(row.allocatedBytes)+' B'),
      elt('td','',row.checksum.toPrecision(11)));
    host.append(line);
  }
  const timestamp=new Date().toISOString();
  const ratiostr=results.map(row=>labels[row.layout]+': '+row.medianMsPerScan.toFixed(4)+' ms/scan').join(' · ');
  $('#benchmark-provenance').textContent='Local measurement · '+timestamp+'\n'+num(size)+' entities · '+repeats+' scans/sample · '+runs+' samples/layout · block size 4 · Float32Array only\n'+ratiostr+'\nAllocation and setup excluded · physical memory layout/cache hits not measured.';
  latestBenchmark={schema:'engineering-codex-memory-benchmark-v1',timestamp,model:'Float32Array (not JS object AoS)',layoutVersion:'lab-002-v1',
    entities:size,pattern,repeatsPerSample:repeats,samplesPerLayout:runs,blockSize:4,
    timer:'performance.now()',metric:'milliseconds per full scan',results,
    note:'Local microbenchmark only; no general hardware performance claim; GC/JIT/thermal effects possible'};
  $('#export-benchmark').disabled=false;
  status.textContent='Done. Five samples per layout; medians shown.';
 }catch(error){status.textContent='Measurement aborted: '+error.message;}
 finally{button.disabled=false;}
}
$('#run-benchmark').addEventListener('click',runBenchmark);
$('#export-benchmark').addEventListener('click',()=>{
 if(!latestBenchmark)return;
 const blob=new Blob([JSON.stringify(latestBenchmark,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='engineering-codex-memory-benchmark.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
renderOverlay();renderModel();
Object.values(benchInputs).filter(x=>x.type==='range').forEach(rangeTrack);
