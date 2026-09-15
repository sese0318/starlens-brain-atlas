// Geometry presentation helpers. Source coordinates and anatomical IDs are immutable.
export function displayPoint(point) {
  return [point[0], point[2], -point[1]];
}

export function compactIndexedGeometry(sourcePositions, sourceIndices) {
  const remap = new Map(), sourceVertexIndices = [], positions = [], indices = [];
  for (const sourceIndex of sourceIndices) {
    if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex * 3 + 2 >= sourcePositions.length)
      throw new Error('A face references a missing anatomical vertex.');
    if (!remap.has(sourceIndex)) {
      remap.set(sourceIndex, sourceVertexIndices.length);
      sourceVertexIndices.push(sourceIndex);
      positions.push(...displayPoint(sourcePositions.slice(sourceIndex * 3, sourceIndex * 3 + 3)));
    }
    indices.push(remap.get(sourceIndex));
  }
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity], center = [0, 0, 0];
  for (let i = 0; i < positions.length; i += 3) for (let d = 0; d < 3; d++) {
    const value = positions[i + d];
    if (!Number.isFinite(value)) throw new Error('Anatomical coordinates must be finite.');
    min[d] = Math.min(min[d], value);
    max[d] = Math.max(max[d], value);
    center[d] += value / sourceVertexIndices.length;
  }
  return {positions, indices, sourceVertexIndices, center, bounds: {min, max}};
}

export function partitionCortex(surface, hemisphere) {
  const labels = new Map(surface.regions.map(region => [region.id, region.key || `ctx-${hemisphere}-${region.name}`]));
  const groups = new Map();
  for (let i = 0; i < surface.faces.length; i += 3) {
    const vertices = surface.faces.slice(i, i + 3);
    const ids = vertices.map(vertex => surface.region_ids[vertex]);
    const id = ids[0] === ids[1] || ids[0] === ids[2] ? ids[0] : ids[1] === ids[2] ? ids[1] : ids[0];
    const key = labels.get(id) || `neutral-${hemisphere}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(...vertices);
  }
  return [...groups].map(([key, faces]) => ({
    key, hemisphere, neutral: key.startsWith('neutral-'), deep: false,
    ...compactIndexedGeometry(surface.positions, faces),
  }));
}

export function boundaryPositions(positions, indices) {
  const edges = new Map();
  for (let i = 0; i < indices.length; i += 3) for (let side = 0; side < 3; side++) {
    const a = indices[i + side], b = indices[i + (side + 1) % 3];
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    const edge = edges.get(key);
    if (edge) edge.count++;
    else edges.set(key, {a, b, count: 1});
  }
  const output = [];
  for (const edge of edges.values()) if (edge.count === 1)
    output.push(...positions.slice(edge.a * 3, edge.a * 3 + 3), ...positions.slice(edge.b * 3, edge.b * 3 + 3));
  return output;
}

export function explosionOffset(center, hemisphere, deep, amount) {
  const progress = Math.max(0, Math.min(1, Number.isFinite(amount) ? amount : 0));
  // An exact origin, not an accumulated animation delta, guarantees exact reassembly.
  if (progress === 0) return [0, 0, 0];
  const lateral = hemisphere === 'lh' ? -1 : 1;
  const direction = [center[0], center[1] - 8, center[2] - 16];
  const length = Math.hypot(...direction) || 1;
  const distance = deep ? 48 : 64;
  return direction.map((value, axis) => progress * (value / length * distance + (axis === 0 ? lateral * (deep ? 18 : 28) : 0)));
}

export function translatedBounds(bounds, offset) {
  return {min: bounds.min.map((v, i) => v + offset[i]), max: bounds.max.map((v, i) => v + offset[i])};
}
