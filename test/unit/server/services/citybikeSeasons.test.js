import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import fetchCitybikeConfigurations, {
  buildCitybikeConfig,
  handleCitybikeSeasonConfigurations,
} from '../../../../server/services/citybikeSeasons';

describe('citybikeSeasons', () => {
  describe('buildCitybikeConfig', () => {
    it('splits the "start-end" inSeason string into a season object', () => {
      const seasonDef = {
        configName: 'hsl',
        networkName: 'helsinki',
        enabled: true,
        preSeason: '03-15',
        inSeason: '04.01-10.31',
      };
      expect(buildCitybikeConfig(seasonDef)).to.deep.equal({
        configName: 'hsl',
        networkName: 'helsinki',
        enabled: true,
        season: {
          preSeasonStart: '03-15',
          start: '04.01',
          end: '10.31',
        },
      });
    });
  });

  describe('handleCitybikeSeasonConfigurations', () => {
    it('filters schedules down to the ones matching the given configName', () => {
      const schedules = [
        {
          configName: 'hsl',
          networkName: 'helsinki',
          enabled: true,
          preSeason: '03-15',
          inSeason: '04-01-10-31',
        },
        {
          configName: 'tampere',
          networkName: 'tampere',
          enabled: true,
          preSeason: '03-15',
          inSeason: '04-01-10-31',
        },
      ];
      const result = handleCitybikeSeasonConfigurations(schedules, 'hsl');
      expect(result).to.have.lengthOf(1);
      expect(result[0].networkName).to.equal('helsinki');
    });
  });

  describe('fetchCitybikeConfigurations (default export)', () => {
    const originalConnString = process.env.CITYBIKE_DB_CONN_STRING;
    const originalDatabase = process.env.CITYBIKE_DATABASE;

    afterEach(() => {
      process.env.CITYBIKE_DB_CONN_STRING = originalConnString;
      process.env.CITYBIKE_DATABASE = originalDatabase;
    });

    it('resolves immediately without touching the database when unconfigured', async () => {
      delete process.env.CITYBIKE_DB_CONN_STRING;
      delete process.env.CITYBIKE_DATABASE;
      const result = await fetchCitybikeConfigurations();
      expect(result).to.be.undefined; // eslint-disable-line no-unused-expressions
    });
  });
});
