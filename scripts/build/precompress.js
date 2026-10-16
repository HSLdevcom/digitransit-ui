// Writes precompressed `.gz`/`.br` siblings next to a file, the way
// express-static-gzip (see server/app.js) expects to find them: it serves
// `<file>.br` or `<file>.gz` whenever one exists next to the requested file.
//
// Webpack's CompressionPlugin already does this for bundle output, but it only
// covers js/css/html/svg/ico, so anything copied into `_static` outside the
// bundle (see copyStatic.js) needs its own pass.

import fs from 'fs';
import zlib from 'zlib';

// Same threshold as CompressionPlugin: keep a compressed file only when it's
// at most 95% of the original size.
const MIN_COMPRESSION_RATIO = 0.95;

/**
 * Writes `<file>.gz` and `<file>.br` next to `file`, skipping (and
 * cleaning up) any variant that doesn't compress well enough to be worth
 * serving.
 *
 * @param {string} file path the content was written to
 * @param {Buffer} content the file's content
 */
export default function precompress(file, content) {
  [
    ['.gz', zlib.gzipSync],
    ['.br', zlib.brotliCompressSync],
  ].forEach(([extension, compressSync]) => {
    const target = `${file}${extension}`;
    const compressed = compressSync(content);
    if (compressed.length / content.length > MIN_COMPRESSION_RATIO) {
      // The output directory isn't cleaned between runs, so drop any sibling a previous run left behind.
      fs.rmSync(target, { force: true });
      return;
    }
    fs.writeFileSync(target, compressed);
  });
}
