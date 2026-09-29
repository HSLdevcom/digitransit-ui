import fetchCitybikeConfigurations, {
  buildCitybikeConfig,
  handleCitybikeSeasonConfigurations,
} from '../../../../server/services/citybikeSeasons';

const {
  fetchAll,
  loadAllRawConfigurations,
  setAvailableCitybikeConfigurations,
} = vi.hoisted(() => ({
  fetchAll: vi.fn(),
  loadAllRawConfigurations: vi.fn(),
  setAvailableCitybikeConfigurations: vi.fn(),
}));
vi.mock('@azure/cosmos', () => ({
  CosmosClient: class {
    // eslint-disable-next-line class-methods-use-this
    database() {
      return {
        container: () => ({ items: { query: () => ({ fetchAll }) } }),
      };
    }
  },
}));
vi.mock('../../../../server/configs/config', () => ({
  loadAllRawConfigurations,
  setAvailableCitybikeConfigurations,
}));

const schedule = (configName, networkName) => ({
  configName,
  networkName,
  enabled: true,
  preSeason: '03.15',
  inSeason: '04.01-10.31',
});

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
      expect(buildCitybikeConfig(seasonDef)).toEqual({
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
      expect(result).toHaveLength(1);
      expect(result[0].networkName).toBe('helsinki');
    });
  });

  describe('fetchCitybikeConfigurations (default export)', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    const stubDatabaseEnv = () => {
      vi.stubEnv('CITYBIKE_DB_CONN_STRING', 'AccountEndpoint=https://db/;');
      vi.stubEnv('CITYBIKE_DATABASE', 'citybikes');
    };

    it('resolves immediately without touching the database when unconfigured', async () => {
      vi.stubEnv('CITYBIKE_DB_CONN_STRING', '');
      vi.stubEnv('CITYBIKE_DATABASE', '');

      await fetchCitybikeConfigurations();

      expect(fetchAll).not.toHaveBeenCalled();
    });

    it('collects season definitions for regions with vehicle rental, without duplicate networks', async () => {
      stubDatabaseEnv();
      fetchAll.mockResolvedValue({
        resources: [
          {
            schedules: [
              schedule('hsl', 'smoove'),
              schedule('tampere', 'inurba'),
            ],
          },
          {
            schedules: [
              schedule('waltti', 'inurba'),
              schedule('matka', 'matka-bikes'),
            ],
          },
        ],
      });
      loadAllRawConfigurations.mockResolvedValue([
        { CONFIG: 'hsl', vehicleRental: { networks: {} } },
        { CONFIG: 'tampere', vehicleRental: { networks: {} } },
        { CONFIG: 'waltti', vehicleRental: { networks: {} } },
        { CONFIG: 'matka', vehicleRental: {} },
      ]);

      await fetchCitybikeConfigurations();

      const [definitions] = setAvailableCitybikeConfigurations.mock.calls[0];
      expect(definitions.map(def => def.networkName)).toEqual([
        'smoove',
        'inurba',
      ]);
    });

    it('logs and resolves when the database query fails', async () => {
      stubDatabaseEnv();
      fetchAll.mockRejectedValue(new Error('down'));

      await fetchCitybikeConfigurations();

      expect(setAvailableCitybikeConfigurations).not.toHaveBeenCalled();
    });
  });
});
