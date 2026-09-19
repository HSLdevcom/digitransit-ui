/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { CosmosClient } from '@azure/cosmos';
import { setAvailableCitybikeConfigurations } from '../configs/config.js';

// See the matching comment in server/services/geoJsonZones.js: anchored via
// `process.cwd()` rather than `import.meta.url` so this file stays loadable
// by the Mocha unit-test suite's `@babel/register`-based require() loader.
const require = createRequire(
  path.join(process.cwd(), 'server/services/citybikeSeasons.js'),
);

const configsDir = path.join(process.cwd(), 'server', 'configs');
const configFiles = fs
  .readdirSync(configsDir)
  .filter(file => /^config\.\w+\.js$/.test(file));

async function fetchCitybikeSeasons() {
  const client = new CosmosClient(process.env.CITYBIKE_DB_CONN_STRING);
  const database = client.database(process.env.CITYBIKE_DATABASE);
  const container = database.container('schedules');
  const query = {
    query: 'SELECT * FROM c',
  };

  const { resources } = await container.items.query(query).fetchAll();
  console.log('citybike season configurations fetched from the database');
  return resources;
}

export function buildCitybikeConfig(seasonDef) {
  const inSeason = seasonDef.inSeason.split('-');
  return {
    configName: seasonDef.configName,
    networkName: seasonDef.networkName,
    enabled: seasonDef.enabled,
    season: {
      preSeasonStart: seasonDef.preSeason,
      start: inSeason[0],
      end: inSeason[1],
    },
  };
}

export function handleCitybikeSeasonConfigurations(schedules, configName) {
  const seasonDefinitions = schedules.filter(
    seasonDef => seasonDef.configName === configName,
  );
  const configurations = [];
  seasonDefinitions.forEach(def =>
    configurations.push(buildCitybikeConfig(def)),
  );
  return configurations;
}

// Fetches citybike season definitions from CosmosDB and patches them into
// the cached config objects via setAvailableCitybikeConfigurations(). Gated
// behind CITYBIKE_DB_CONN_STRING/CITYBIKE_DATABASE.
export default function fetchCitybikeConfigurations() {
  if (!process.env.CITYBIKE_DB_CONN_STRING || !process.env.CITYBIKE_DATABASE) {
    return Promise.resolve();
  }

  return new Promise(mainResolve => {
    const promises = [];

    fetchCitybikeSeasons()
      .then(r => {
        const schedules = [];
        r.forEach(seasonDef => schedules.push(...seasonDef.schedules));
        configFiles.forEach(file => {
          // eslint-disable-next-line import/no-dynamic-require
          const conf = require(`${configsDir}/${file}`);
          const configName = conf.default.CONFIG;
          const { vehicleRental } = conf.default;
          if (vehicleRental && Object.keys(vehicleRental).length > 0) {
            promises.push(
              new Promise(resolve => {
                resolve(
                  handleCitybikeSeasonConfigurations(schedules, configName),
                );
              }),
            );
          }
        });
        Promise.all(promises).then(definitions => {
          // filter empty objects and duplicates
          const seasonDefinitions = definitions
            .filter(seasonDef => Object.keys(seasonDef).length > 0)
            .flat()
            .filter(
              (v, i, a) =>
                a.findIndex(v2 => v2.networkName === v.networkName) === i,
            );
          console.log(
            `fetched: ${seasonDefinitions.length} citybike season configuration`,
          );
          console.log(seasonDefinitions);
          setAvailableCitybikeConfigurations(seasonDefinitions);
          mainResolve();
        });
      })
      .catch(err => {
        console.log('error fetching citybike season configurations', err);
        mainResolve();
      });
  });
}
