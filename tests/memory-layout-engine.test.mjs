import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FIELDS,LAYOUTS,createDataset,locate,describeCells,accessTrace,structOverlay,scanDataset,median} from '../src/memory-layout-engine.mjs';

test('AoS stores each fish in three adjacent float32 cells',()=>{
 const d=createDataset('aos',6,4);
 assert.equal(d.buffers.length,1);
 assert.equal(d.allocatedBytes,72);
 assert.equal(d.paddingBytes,0);
 assert.deepEqual(locate(d,2,'x'),{bufferIndex:0,bufferId:'records',elementIndex:6,byteOffset:24});
 assert.equal(locate(d,2,'health').byteOffset,32);
});

test('SoA uses three separate real ArrayBuffers with independent offsets',()=>{
 const d=createDataset('soa',6,4);
 assert.equal(d.buffers.length,3);
 assert.equal(d.allocatedBytes,72);
 assert.equal(d.buffers[0].values.byteLength,24);
 assert.notEqual(d.buffers[0].values.buffer,d.buffers[1].values.buffer);
 assert.deepEqual(locate(d,2,'y'),{bufferIndex:1,bufferId:'y',elementIndex:2,byteOffset:8});
});

test('AoSoA blocks contain 4 of each field and pad only the final block',()=>{
 const d=createDataset('aosoa',6,4);
 assert.equal(d.buffers.length,1);
 assert.equal(d.paddedCount,8);
 assert.equal(d.logicalBytes,72);
 assert.equal(d.allocatedBytes,96);
 assert.equal(d.paddingBytes,24);
 assert.equal(locate(d,0,'x').byteOffset,0);
 assert.equal(locate(d,3,'x').byteOffset,12);
 assert.equal(locate(d,0,'y').byteOffset,16);
 assert.equal(locate(d,0,'health').byteOffset,32);
 assert.equal(locate(d,4,'x').byteOffset,48);
 const all=describeCells(d)[0].cells;
 assert.equal(all.length,24);
 assert.equal(all.filter(c=>c.padding).length,6);
 assert.ok(all.filter(c=>c.padding).every(c=>c.entity>=6));
});

test('same data and scan result across all layouts, patterns, sizes and block sizes',()=>{
 for(const count of [1,2,4,6,7,11,40,101]){
   for(const b of [2,3,4,8]){
     const datasets=LAYOUTS.map(layout=>createDataset(layout,count,b));
     for(const pattern of ['positions','entity','health']){
       const result=datasets.map(d=>scanDataset(d,pattern,3));
       assert.ok(result.every(v=>Math.abs(v-result[0])<=1e-10*Math.max(1,Math.abs(result[0]))));
     }
   }
 }
});

test('field traces point exactly at the actual underlying typed-array cells',()=>{
 for(const layout of LAYOUTS) {
   const d=createDataset(layout,6,4);
   const cells=describeCells(d);
   for(const pattern of ['positions','entity','health']) {
     const trace=accessTrace(d,pattern);
     assert.equal(trace.length,pattern==='entity'?3:pattern==='positions'?12:6);
     for(const step of trace) {
       const item=cells[step.bufferIndex].cells[step.elementIndex];
       assert.equal(item.field,step.field);
       assert.equal(item.entity,step.entity);
       assert.equal(item.byteOffset,step.byteOffset);
     }
   }
 }
});

test('DataView overlay uses exact 12-byte little-endian encoding with 3 padding bytes',()=>{
 const d=structOverlay();
 assert.equal(d.byteLength,12);
 assert.deepEqual(d.bytes.map(b=>b.hex),['00','00','C0','3F','64','00','00','00','00','00','10','40']);
 assert.equal(d.decoded.x,1.5);
 assert.equal(d.decoded.health,100);
 assert.equal(d.decoded.y,2.25);
 assert.deepEqual(d.bytes.filter(b=>b.field==='padding').map(b=>b.offset),[5,6,7]);
});

test('median is non-mutating and handles odd/even sample counts',()=>{
 const a=[9,1,5],b=[5,1,8,2];
 assert.equal(median(a),5);
 assert.equal(median(b),3.5);
 assert.deepEqual(a,[9,1,5]);
 assert.throws(()=>median([]),RangeError);
});

test('invalid layout, count, block size and scan args are rejected',()=>{
 assert.throws(()=>createDataset('invalid',4),RangeError);
 assert.throws(()=>createDataset('aos',0),RangeError);
 assert.throws(()=>createDataset('aosoa',4,0),RangeError);
 const d=createDataset('aos',6);
 assert.throws(()=>locate(d,99,'x'),RangeError);
 assert.throws(()=>locate(d,0,'z'),RangeError);
 assert.throws(()=>scanDataset(d,'invalid'),RangeError);
 assert.throws(()=>scanDataset(d,'health',0),RangeError);
});

test('Memory Lab 002 ships with an auditable allowlist and explicit measured-time disclaimer',()=>{
 const page=readFileSync(new URL('../labs/memory-layout/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../src/memory-layout-lab.mjs',import.meta.url),'utf8');
 const build=readFileSync(new URL('../scripts/build_pages.py',import.meta.url),'utf8');
 for(const id of ['memory-map','trace-step','struct-bytes','run-benchmark','export-benchmark','benchmark-rows']) assert.ok(page.includes('id="'+id+'"'));
 for(const path of ['src/memory-layout-engine.mjs','src/memory-layout-lab.mjs','labs/memory-layout/index.html','labs/memory-layout/lab.css'])
   assert.ok(build.includes('"'+path+'"'));
 assert.match(page,/physical memory layout\/cache hits not measured|physical RAM placement cannot be inspected/);
 assert.match(js,/performance\.now\(\)/);
 assert.match(js,/JSON\.stringify\(latestBenchmark/);
});
