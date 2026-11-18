/**
 * Memory Layout Lab 002 — exact byte offsets in controlled Float32Array buffers.
 * These are REAL ArrayBuffers created by this model. They are NOT process addresses.
 * All three layouts use the same three float32 fields: x, y, and health.
 * AoSoA pads the last block to its fixed block capacity.
 */
export const FIELDS = Object.freeze(['x', 'y', 'health']);
export const LAYOUTS = Object.freeze(['aos', 'soa', 'aosoa']);
export const ACCESS_PATTERNS = Object.freeze(['positions', 'entity', 'health']);

export function createDataset(layout, count, blockSize = 4) {
  if (!LAYOUTS.includes(layout)) throw new RangeError('unknown layout');
  if (!Number.isInteger(count) || count < 1 || count > 200000) throw new RangeError('count must be 1..200000');
  if (!Number.isInteger(blockSize) || blockSize < 2 || blockSize > 32) throw new RangeError('blockSize must be 2..32');
  const paddedCount = layout === 'aosoa' ? Math.ceil(count / blockSize) * blockSize : count;
  const buffers = layout === 'soa'
    ? FIELDS.map(field => ({id: field, values: new Float32Array(count)}))
    : [{id: 'records', values: new Float32Array(paddedCount * 3)}];
  const dataset = {layout, count, blockSize, paddedCount, buffers,
    get allocatedBytes() {return buffers.reduce((total, b) => total + b.values.byteLength, 0);},
    get logicalBytes() {return count * 3 * 4;},
    get paddingBytes() {return (paddedCount - count) * 3 * 4;}};
  for (let i = 0; i < count; i++) {
    const values = [(i % 997) / 997, (i % 991) / 991, i % 100];
    for (let f = 0; f < FIELDS.length; f++) {
      const at = locate(dataset, i, FIELDS[f]);
      dataset.buffers[at.bufferIndex].values[at.elementIndex] = values[f];
    }
  }
  return dataset;
}

export function locate(dataset, entity, field) {
  const fieldIndex = FIELDS.indexOf(field);
  if (!Number.isInteger(entity) || entity < 0 || entity >= dataset.count || fieldIndex < 0)
    throw new RangeError('invalid field or entity');
  let bufferIndex = 0, elementIndex;
  if (dataset.layout === 'aos') elementIndex = entity * 3 + fieldIndex;
  else if (dataset.layout === 'soa') {bufferIndex = fieldIndex; elementIndex = entity;}
  else {
    const group = Math.floor(entity / dataset.blockSize);
    const slot = entity % dataset.blockSize;
    elementIndex = group * 3 * dataset.blockSize + fieldIndex * dataset.blockSize + slot;
  }
  return {bufferIndex, bufferId: dataset.buffers[bufferIndex].id, elementIndex, byteOffset: elementIndex * 4};
}

/** Enumerate physical 4-byte slots, including explicit AoSoA padding. */
export function describeCells(dataset) {
  return dataset.buffers.map((buffer, bufferIndex) => {
    const cells = [];
    for (let index = 0; index < buffer.values.length; index++) {
      let entity, fieldIndex;
      if (dataset.layout === 'aos') {
        entity = Math.floor(index / 3);
        fieldIndex = index % 3;
      } else if (dataset.layout === 'soa') {
        entity = index;
        fieldIndex = bufferIndex;
      } else {
        const b = dataset.blockSize, group = Math.floor(index / (3 * b));
        const within = index % (3 * b);
        fieldIndex = Math.floor(within / b);
        entity = group * b + within % b;
      }
      cells.push({bufferId: buffer.id, bufferIndex, elementIndex: index, byteOffset: index * 4,
        entity, field: FIELDS[fieldIndex], value: buffer.values[index], padding: entity >= dataset.count});
    }
    return {id:buffer.id, byteLength:buffer.values.byteLength, cells};
  });
}

/** Pure, exact field locations for a requested access pattern. No speculative cache hits. */
export function accessTrace(dataset, pattern, targetEntity = 2) {
  if (!ACCESS_PATTERNS.includes(pattern)) throw new RangeError('unknown pattern');
  const events = [];
  const add = (entity,field) => events.push({entity,field,...locate(dataset,entity,field)});
  if(pattern === 'entity') {
    const entity = Math.min(Math.max(0,Math.trunc(targetEntity)),dataset.count-1);
    FIELDS.forEach(field=>add(entity,field));
  } else {
    for(let i=0;i<dataset.count;i++) {
      const fields = pattern === 'health' ? ['health'] : ['x','y'];
      fields.forEach(field=>add(i,field));
    }
  }
  return events;
}

/** Explicit 12-byte little-endian DataView record: float x, uint8 health, pad 3, float y.
 * Padding is OUR chosen wire/demo layout, not a universal C struct ABI.
 */
export function structOverlay(x=1.5, health=100, y=2.25) {
  const buffer = new ArrayBuffer(12), view = new DataView(buffer);
  view.setFloat32(0,x,true);
  view.setUint8(4,health);
  view.setFloat32(8,y,true);
  const tags = ['x','x','x','x','health','padding','padding','padding','y','y','y','y'];
  return {bytes:[...new Uint8Array(buffer)].map((value,offset) =>
    ({offset,hex:value.toString(16).padStart(2,'0').toUpperCase(),field:tags[offset]})),
    byteLength:buffer.byteLength, decoded:{x:view.getFloat32(0,true),health:view.getUint8(4),y:view.getFloat32(8,true)}};
}

/** Benchmark kernel. Real elapsed time is measured separately by the caller.
 * No array/object conversion inside the timed scan; layout-specific indexing only.
 */
export function scanDataset(dataset, pattern='positions', repeats=1) {
  if(!ACCESS_PATTERNS.includes(pattern)) throw new RangeError('unknown pattern');
  if (!Number.isInteger(repeats)||repeats<1||repeats>1000) throw new RangeError('invalid repeats');
  const {layout,count,blockSize,buffers}=dataset;
  let total=0;
  if(layout==='aos'){
    const data=buffers[0].values;
    if(pattern==='positions') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=data[i*3]+data[i*3+1];
    else if(pattern==='health') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=data[i*3+2];
    else for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=data[i*3]+data[i*3+1]+data[i*3+2];
  } else if(layout==='soa'){
    const x=buffers[0].values,y=buffers[1].values,h=buffers[2].values;
    if(pattern==='positions') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=x[i]+y[i];
    else if(pattern==='health') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=h[i];
    else for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) total+=x[i]+y[i]+h[i];
  } else {
    const d=buffers[0].values,b=blockSize;
    if(pattern==='positions') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) {
      const offset=Math.floor(i/b)*b*3+i%b;total+=d[offset]+d[offset+b];
    }
    else if(pattern==='health') for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) {
      const offset=Math.floor(i/b)*b*3+i%b;total+=d[offset+2*b];
    }
    else for(let r=0;r<repeats;r++) for(let i=0;i<count;i++) {
      const offset=Math.floor(i/b)*b*3+i%b;total+=d[offset]+d[offset+b]+d[offset+2*b];
    }
  }
  return total;
}

export function median(samples) {
  if(!Array.isArray(samples)||!samples.length||samples.some(v=>!Number.isFinite(v))) throw new RangeError('invalid samples');
  const sorted=[...samples].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}
