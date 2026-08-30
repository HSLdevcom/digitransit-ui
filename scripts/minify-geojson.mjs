/**
 * Minify the geojson files that the `static` npm script copied into `_static`.
 * Replaces the `CopyWebpackPlugin` `transform` that did the same under webpack.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('_static/assets/geojson');

if (!existsSync(dir)) {
  process.exit(0);
}

const files = (await readdir(dir)).filter(f => f.endsWith('.geojson'));
let bytesBefore = 0;
let bytesAfter = 0;

await Promise.all(
  files.map(async f => {
    const p = path.join(dir, f);
    const raw = await readFile(p, 'utf8');
    const min = JSON.stringify(JSON.parse(raw));
    bytesBefore += Buffer.byteLength(raw);
    bytesAfter += Buffer.byteLength(min);
    await writeFile(p, min);
  }),
);

// eslint-disable-next-line no-console
console.log(
  `minify-geojson: ${files.length} files, ${bytesBefore} -> ${bytesAfter} bytes`,
);
