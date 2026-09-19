/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { getJson } from '../../utils/shared/xhrPromise.js';
import { setAssembledZones } from '../configs/config.js';

// Node 24 `require()`s an ESM `config.*.js` graph directly (none use
// top-level await), so this stays synchronous instead of turning its
// promise executor async. Anchored via `process.cwd()` rather than
// `import.meta.url`: a file containing `import.meta` can't be transpiled to
// CommonJS by `@babel/register`, which breaks the Mocha unit-test suite's
// require()-based module loading. createRequire's returned function is
// always called below with an already-fully-absolute path built from
// `configsDir`, so the anchor itself only needs to be *some* valid absolute
// location, not this file's true location.
const require = createRequire(
  path.join(process.cwd(), 'server/services/geoJsonZones.js'),
);

const configsDir = path.join(process.cwd(), 'server', 'configs');
const configFiles = fs
  .readdirSync(configsDir)
  // matches only the per-region `config.<name>.js` files, not the shared
  // `config.js` module that lives alongside them in this directory.
  .filter(file => /^config\.\w+\.js$/.test(file));

let allZones;

export function getZoneUrl(json) {
  const zoneLayer =
    !json?.noZoneSharing &&
    json?.layers.find(
      layer => layer.name.fi === 'Vyöhykkeet' || layer.name.en === 'Zones',
    );
  if (zoneLayer && !allZones) {
    // use a geoJson source to initialize combined zone data
    allZones = zoneLayer;
  }
  return zoneLayer?.url;
}

async function fetchGeoJsonConfig(url) {
  try {
    const response = await getJson(url);
    return response.geoJson || response.geojson;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Assembles a combined geoJson zone layer across all region configs and
// patches it into the cached config objects via setAssembledZones(). Gated
// behind ASSEMBLE_GEOJSON.
export default function collectGeoJsonZones() {
  if (!process.env.ASSEMBLE_GEOJSON) {
    return Promise.resolve();
  }
  return new Promise(mainResolve => {
    const promises = [];
    configFiles.forEach(file => {
      // eslint-disable-next-line import/no-dynamic-require
      const conf = require(`${configsDir}/${file}`);
      const { geoJson } = conf.default;
      if (geoJson) {
        if (geoJson.layerConfigUrl) {
          promises.push(
            new Promise(resolve => {
              fetchGeoJsonConfig(geoJson.layerConfigUrl).then(data => {
                resolve(getZoneUrl(data));
              });
            }),
          );
        } else {
          promises.push(
            new Promise(resolve => {
              resolve(getZoneUrl(geoJson));
            }),
          );
        }
      }
    });

    Promise.all(promises).then(urls => {
      if (allZones) {
        // valid zone data was found
        allZones.url = urls.filter(url => !!url); // drop invalid
        console.log(`Assembled ${allZones.url.length} geoJson zones`);
        setAssembledZones(allZones);
      }
      mainResolve();
    });
  });
}
