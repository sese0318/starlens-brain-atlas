// Extracted from the original DopaTeam prototype. Inputs are numeric arrays.
const finite = values => values.every(Number.isFinite);

export function ranks(values) {
  if (!Array.isArray(values) || !finite(values)) throw new Error('Expected finite numeric values.');
  const sorted = values.map((v, i) => ({v, i})).sort((a, b) => a.v - b.v);
  const out = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].v === sorted[i].v) j++;
    const rank = (i + j + 1) / 2;
    for (let k = i; k < j; k++) out[sorted[k].i] = rank;
    i = j;
  }
  return out;
}

export function pearson(a, b) {
  if (a.length !== b.length || a.length < 3 || !finite(a) || !finite(b)) return null;
  const ma = a.reduce((s, x) => s + x, 0) / a.length;
  const mb = b.reduce((s, x) => s + x, 0) / b.length;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    cov += x * y;
    va += x * x;
    vb += y * y;
  }
  return va === 0 || vb === 0 ? null : Math.max(-1, Math.min(1, cov / Math.sqrt(va * vb)));
}

export function spearman(a, b) {
  if (a.length !== b.length || a.length < 3 || !finite(a) || !finite(b)) return null;
  return pearson(ranks(a), ranks(b));
}

export function standardize(a) {
  const mean = a.reduce((s, x) => s + x, 0) / a.length;
  const sd = Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length);
  return sd > 0 ? a.map(x => (x - mean) / sd) : a.map(() => 0);
}

export function rankMaps(profile, maps) {
  return maps.map(m => ({...m, rho: spearman(profile, m.values)}))
    .sort((a, b) => (Math.abs(b.rho ?? 0) - Math.abs(a.rho ?? 0)) || a.id.localeCompare(b.id));
}

export function looRange(a, b) {
  const all = a.map((_, i) => spearman(a.filter((_, k) => k !== i), b.filter((_, k) => k !== i)))
    .filter(v => v !== null);
  return all.length ? {min: Math.min(...all), max: Math.max(...all)} : null;
}
