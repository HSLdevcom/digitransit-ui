import { CosmosClient } from '@azure/cosmos';
import {
  loadAllRawConfigurations,
  setAvailableCitybikeConfigurations,
} from '../configs/config.js';

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

/**
 * Fetches citybike season definitions from CosmosDB and patches them into
 * the cached config objects via setAvailableCitybikeConfigurations(). Gated
 * behind CITYBIKE_DB_CONN_STRING/CITYBIKE_DATABASE.
 */
export default async function fetchCitybikeConfigurations() {
  if (!process.env.CITYBIKE_DB_CONN_STRING || !process.env.CITYBIKE_DATABASE) {
    return;
  }

  try {
    const seasons = await fetchCitybikeSeasons();
    const schedules = seasons.flatMap(seasonDef => seasonDef.schedules);
    const configs = await loadAllRawConfigurations();
    const seasonDefinitions = configs
      .filter(
        config =>
          config.vehicleRental && Object.keys(config.vehicleRental).length > 0,
      )
      .flatMap(config =>
        handleCitybikeSeasonConfigurations(schedules, config.CONFIG),
      )
      // drop duplicates
      .filter(
        (v, i, a) => a.findIndex(v2 => v2.networkName === v.networkName) === i,
      );
    console.log(
      `fetched: ${seasonDefinitions.length} citybike season configuration`,
    );
    console.log(seasonDefinitions);
    setAvailableCitybikeConfigurations(seasonDefinitions);
  } catch (err) {
    console.log('error fetching citybike season configurations', err);
  }
}
