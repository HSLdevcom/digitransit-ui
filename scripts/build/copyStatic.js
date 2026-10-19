#!/usr/bin/env node

// Copies `static/` into the served `_static/` output directory. Runs outside
// the bundler, before both `yarn build` (via `prebuild`) and `yarn dev` (via
// scripts/dev.sh).
//
// - Every config's folder is copied whatever $CONFIG is. A deployment with no
//   $CONFIG set resolves its config per request from the Host header
//   (getConfiguration in server/configs/config.js), so one server can serve
//   any region; and with ASSEMBLE_GEOJSON, server/services/geoJsonZones.js
//   makes a config load every config's zone GeoJSON.
// - GeoJSON files are minified.
// - GeoJSON files also get `.gz`/`.br` siblings, which express-static-gzip in
//   server/app.js serves when the browser accepts them.

import fs from 'fs';
import path from 'path';
import precompress from './precompress.js';

const rootDir = path.resolve(import.meta.dirname, '../..');
const srcDir = path.join(rootDir, 'static');
const destDir = path.join(rootDir, '_static');

function minifyGeoJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return Buffer.from(JSON.stringify(JSON.parse(raw)));
}

function copyFile(from, to) {
  if (path.extname(from) === '.geojson') {
    const minified = minifyGeoJson(from);
    fs.writeFileSync(to, minified);
    precompress(to, minified);
    return;
  }
  fs.copyFileSync(from, to);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

// Webpack writes its own output into these; create them up front so the
// directories exist even when a build hasn't run yet.
fs.mkdirSync(path.join(destDir, 'js'), { recursive: true });
fs.mkdirSync(path.join(destDir, 'css'), { recursive: true });

copyDir(srcDir, destDir);
