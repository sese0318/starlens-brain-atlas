import { copyFileSync } from 'node:fs';

// The standalone atlas opens at both the site root and the existing demo URL.
copyFileSync(new URL('../dist/prototype.html', import.meta.url),
  new URL('../dist/index.html', import.meta.url));
