import {
  defaultNetworkConfig,
  getCityBikeNetworkId,
  getCityBikeNetworkIcon,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
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
});
