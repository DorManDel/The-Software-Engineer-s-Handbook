import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {quantize, exactDecimalFixedPoint, minimumBitsForPixelTolerance, packedByteCount, storageComparison} from '../src/quantization-engine.mjs';

test('0.447 is a counterexample: 12-bit actual error exceeds 8-bit actual error', () => {
  const a=quantize(0.447,8),b=quantize(0.447,12),c=quantize(0.447,16);
  assert.equal(a.encoded,114);
  assert.equal(b.encoded,1830);
  assert.ok(Math.abs(a.decoded-0.4470588235294118)<1e-14);
  assert.ok(Math.abs(b.decoded-0.4468864468864469)<1e-14);
  assert.ok(b.error>a.error);
  assert.ok(b.maxError<a.maxError);
  assert.ok(c.maxError<b.maxError);
  assert.ok(c.error<b.error);
});

test('all sampled positions meet the worst-case normalized error bound', () => {
  for(const bits of [4,8,12,16,17,24,32]){
    for(let sample=0;sample<=1000;sample++){
      const result=quantize(sample/1000,bits);
      assert.ok(result.error<=result.maxError+1e-13);
      assert.ok(result.decoded>=0&&result.decoded<=1);
      assert.ok(Number.isInteger(result.encoded));
    }
  }
});

test('decimal five places: all grid values roundtrip using fixed point with 17 bits', () => {
  for(let n=0;n<=100000;n+=337){
    const result=exactDecimalFixedPoint(n/100000,5);
    assert.equal(result.encoded,n);
    assert.equal(result.bits,17);
    assert.equal(result.decoded,n/100000);
  }
  assert.equal(exactDecimalFixedPoint(1,5).encoded,100000);
});

test('pixel tolerance sizing is based on the worst-case guarantee', () => {
  assert.equal(minimumBitsForPixelTolerance(500,0.1),12);
  assert.equal(minimumBitsForPixelTolerance(500,0.01),15);
  assert.equal(minimumBitsForPixelTolerance(500,0.001),18);
});

test('bit-packed payload math explicitly excludes overhead', () => {
  assert.equal(packedByteCount(100,2,12),300);
  assert.equal(packedByteCount(1,2,12),3);
  assert.deepEqual(storageComparison(100,2,12,20),{
    float32Bytes:800,idealPackedBytes:300,savings:500,
    payloadBytesPerSecond:6000,float32BytesPerSecond:16000
  });
});

test('bad numeric inputs are rejected', () => {
  assert.throws(()=>quantize(-0.1,8),RangeError);
  assert.throws(()=>quantize(0.3,0),RangeError);
  assert.throws(()=>exactDecimalFixedPoint(2,5),RangeError);
  assert.throws(()=>minimumBitsForPixelTolerance(0,1),RangeError);
  assert.throws(()=>packedByteCount(-1,2,8),RangeError);
});

test('new public lab is linked, modular and included in the auditable allowlist', () => {
  const root=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const page=readFileSync(new URL('../labs/quantization/index.html',import.meta.url),'utf8');
  const build=readFileSync(new URL('../scripts/build_pages.py',import.meta.url),'utf8');
  assert.match(root,/href="\.\/labs\/quantization\/"/);
  assert.match(page,/id="position"/);
  assert.match(page,/id="tolerance"/);
  assert.match(page,/src\/quantization-lab\.mjs/);
  for(const path of ['src/quantization-engine.mjs','src/quantization-lab.mjs','labs/quantization/index.html','labs/quantization/lab.css']) {
    assert.ok(build.includes('"' + path + '"'));
  }
});
