import {
  defaultNetworkConfig,
  getCityBikeNetworkId,
  getCityBikeNetworkIcon,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
  getCityBikeUrl,
  getCityBikeType,
} from '../../../app/util/citybikes';

describe('citybikes', () => {
  describe('getCityBikeNetworkId', () => {
    it('should default to undefined', () => {
      expect(getCityBikeNetworkId(undefined)).to.equal(undefined);
      expect(getCityBikeNetworkId([])).to.equal(undefined);
    });

    it('should pick the first networkId', () => {
      const networks = ['Samocat', 'Smoove'];
      expect(getCityBikeNetworkId(networks)).to.equal('Samocat');
    });

    it('should also accept an input string', () => {
      const networks = 'Samocat';
      expect(getCityBikeNetworkId(networks)).to.equal('Samocat');
    });
  });

  describe('getCityBikeNetworkConfig', () => {
    it('should default to a default config', () => {
      expect(getCityBikeNetworkConfig(undefined, {})).to.equal(
        defaultNetworkConfig,
      );
      expect(getCityBikeNetworkConfig('Smoove', {})).to.equal(
        defaultNetworkConfig,
      );
      expect(getCityBikeNetworkConfig('Smoove', { cityBike: {} })).to.equal(
        defaultNetworkConfig,
      );
      expect(
        getCityBikeNetworkConfig('Smoove', { cityBike: { networks: {} } }),
      ).to.equal(defaultNetworkConfig);
      expect(
        getCityBikeNetworkConfig('Smoove', {
          cityBike: { networks: { smoove: {} } },
        }),
      ).to.equal(defaultNetworkConfig);
    });

    it('should return the configuration by the given network id', () => {
      const config = {
        cityBike: {
          networks: {
            foobar: {
              icon: 'citybike',
              type: 'scooter',
            },
          },
        },
      };
      expect(getCityBikeNetworkConfig('foobar', config)).to.equal(
        config.cityBike.networks.foobar,
      );
    });

    it('should convert networkId to lowercase', () => {
      const config = {
        cityBike: {
          networks: {
            foobar: {
              icon: 'citybike',
              type: 'scooter',
            },
          },
        },
      };
      expect(getCityBikeNetworkConfig('Foobar', config)).to.equal(
        config.cityBike.networks.foobar,
      );
    });
  });

  describe('getCityBikeNetworkIcon', () => {
    it('should default to "icon-icon_citybike"', () => {
      const result = getCityBikeNetworkIcon();
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should default to "icon-icon_citybike" if no icon has been defined', () => {
      const networkConfig = {
        icon: undefined,
      };
      const result = getCityBikeNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should return the given icon', () => {
      const networkConfig = {
        icon: 'foobar',
      };
      const result = getCityBikeNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_foobar');
    });
  });

  describe('getCityBikeNetworkName', () => {
    it('should default to undefined', () => {
      const result = getCityBikeNetworkName();
      expect(result).to.equal(undefined);
    });

    it('should return undefined if no matching language term exists', () => {
      const networkConfig = { name: { en: 'Test' } };
      const language = 'sv';
      const result = getCityBikeNetworkName(networkConfig, language);
      expect(result).to.equal(undefined);
    });

    it('should pick the name for the given language', () => {
      const networkConfig = { name: { fi: 'Testi' } };
      const language = 'fi';
      const result = getCityBikeNetworkName(networkConfig, language);
      expect(result).to.equal('Testi');
    });
  });

  describe('getCityBikeUrl', () => {
    it('should return undefined if cityBike config does not exist', () => {
      const networks = ['foo', 'bar'];
      const language = 'en';
      const config = {};
      const result = getCityBikeUrl(networks, language, config);
      expect(result).to.equal(undefined);
    });

    it('should return undefined if no matching language term exists', () => {
      const networks = ['foobar', 'foo'];
      const language = 'en';
      const config = {
        cityBike: {
          networks: {
            foobar: {
              url: {
                fi: 'https://www.url.fi/',
              },
            },
          },
        },
      };
      const result = getCityBikeUrl(networks, language, config);
      expect(result).to.equal(undefined);
    });

    it('should return network specific url if it exists', () => {
      const networks = ['foobar', 'bar'];
      const language = 'fi';
      const config = {
        cityBike: {
          networks: {
            foobar: {
              url: {
                fi: 'https://www.url.fi/',
              },
            },
          },
        },
      };
      const result = getCityBikeUrl(networks, language, config);
      expect(result).to.equal(config.cityBike.networks.foobar.url.fi);
    });
  });

  describe('getCityBikeType', () => {
    it('should return citybike if type config for network does not exist', () => {
      const networks = ['foo', 'bar'];
      const config = {};
      const result = getCityBikeType(networks, config);
      expect(result).to.equal('citybike');
    });

    it('should return correct citybike type if it is configured', () => {
      const networks = ['foobar', 'foo'];
      const config = {
        cityBike: {
          networks: {
            foobar: {
              type: 'scooter',
            },
          },
        },
      };
      const result = getCityBikeType(networks, config);
      expect(result).to.equal('scooter');
    });
  });
});
