// Quantization Lab 001 — pure, dependency-free educational model.
// Coordinates are normalized into [0, 1]. Storage figures exclude framing,
// metadata, alignment and runtime object overhead unless explicitly noted.
export const BIT_CHOICES = [4, 8, 12, 16, 17, 24, 32];

export function quantize(x, bits) {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError('x must be within [0, 1]');
  if (!Number.isInteger(bits) || bits < 1 || bits > 32) throw new RangeError('bits must be 1..32');
  const levels = 2 ** bits - 1;
  const encoded = Math.round(x * levels);
  const decoded = encoded / levels;
  return {bits, levels, encoded, decoded, error: Math.abs(decoded - x), step: 1 / levels, maxError: 1 / (2 * levels)};
}

export function exactDecimalFixedPoint(x, decimalPlaces = 5) {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new RangeError('x must be within [0, 1]');
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 12) throw new RangeError('invalid decimalPlaces');
  const scale = 10 ** decimalPlaces;
  const encoded = Math.round(x * scale);
  return {encoded, decoded: encoded / scale, decimalPlaces, bits: Math.ceil(Math.log2(scale + 1)), error: Math.abs(x - encoded / scale)};
}

export function minimumBitsForPixelTolerance(widthPx, tolerancePx, maxBits = 32) {
  if (!(widthPx > 0) || !(tolerancePx > 0)) throw new RangeError('width and tolerance must be positive');
  for (let bits = 1; bits <= maxBits; bits++) {
    if (widthPx / (2 * (2 ** bits - 1)) <= tolerancePx) return bits;
  }
  return null;
}

export function packedByteCount(items, coordinatesPerItem, bits) {
  if (![items, coordinatesPerItem, bits].every(Number.isInteger) ||
      items < 0 || coordinatesPerItem < 1 || bits < 1 || bits > 32) throw new RangeError('invalid packing dimensions');
  return Math.ceil(items * coordinatesPerItem * bits / 8);
}

export function storageComparison(items, coordinatesPerItem, bits, updatesPerSecond = 1) {
  if (!(Number.isFinite(updatesPerSecond) && updatesPerSecond >= 0)) throw new RangeError('invalid update frequency');
  const float32Bytes = items * coordinatesPerItem * 4;
  const idealPackedBytes = packedByteCount(items, coordinatesPerItem, bits);
  return {float32Bytes, idealPackedBytes, savings: float32Bytes - idealPackedBytes,
    payloadBytesPerSecond: idealPackedBytes * updatesPerSecond,
    float32BytesPerSecond: float32Bytes * updatesPerSecond};
}
