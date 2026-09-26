/* eslint-disable no-console */
import { getJson } from '../../utils/shared/xhrPromise.js';
import {
  loadAllRawConfigurations,
  setAssembledZones,
} from '../configs/config.js';

let allZones;

export function getZoneUrl(json) {
  const zoneLayer =
    !json?.noZoneSharing &&
    json?.layers?.find(
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

/**
 * Assembles a combined geoJson zone layer across all region configs and
 * patches it into the cached config objects via setAssembledZones(). Gated
 * behind ASSEMBLE_GEOJSON.
 */
export default async function collectGeoJsonZones() {
  if (!process.env.ASSEMBLE_GEOJSON) {
    return;
  }
  const configs = await loadAllRawConfigurations();
  // Inline geoJson configs are resolved synchronously here, before any
  // remote layer config fetch completes, so getZoneUrl() picks the first
  // inline zone layer (in config file order) to initialize allZones.
  const urls = await Promise.all(
    configs
      .map(config => config.geoJson)
      .filter(geoJson => geoJson)
      .map(geoJson =>
        geoJson.layerConfigUrl
          ? fetchGeoJsonConfig(geoJson.layerConfigUrl).then(getZoneUrl)
          : getZoneUrl(geoJson),
      ),
  );

  if (allZones) {
    // valid zone data was found
    allZones.url = urls.filter(url => !!url); // drop invalid
    console.log(`Assembled ${allZones.url.length} geoJson zones`);
    setAssembledZones(allZones);
  }
}
