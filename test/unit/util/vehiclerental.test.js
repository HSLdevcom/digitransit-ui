import {
  defaultNetworkConfig,
  getRentalNetworkId,
  getRentalNetworkIcon,
  getRentalNetworkName,
  getRentalNetworkConfig,
} from '../../../app/util/vehicleRentalUtils';

describe('vehiclerental', () => {
  describe('getRentalNetworkId', () => {
    it('should default to undefined', () => {
      expect(getRentalNetworkId(undefined)).to.equal(undefined);
      expect(getRentalNetworkId([])).to.equal(undefined);
    });

    it('should pick the first networkId', () => {
      const networks = ['Samocat', 'Smoove'];
      expect(getRentalNetworkId(networks)).to.equal('Samocat');
    });

    it('should also accept an input string', () => {
      const networks = 'Samocat';
      expect(getRentalNetworkId(networks)).to.equal('Samocat');
    });
  });

  describe('getRentalNetworkId', () => {
    it('should default to a default config', () => {
      expect(getRentalNetworkConfig(undefined, {})).to.equal(
        defaultNetworkConfig,
      );
      expect(getRentalNetworkConfig('Smoove', {})).to.equal(
        defaultNetworkConfig,
      );
      expect(getRentalNetworkConfig('Smoove', { cityBike: {} })).to.equal(
        defaultNetworkConfig,
      );
      expect(
        getRentalNetworkConfig('Smoove', {
          cityBike: { networks: {} },
        }),
      ).to.equal(defaultNetworkConfig);
      expect(
        getRentalNetworkConfig('Smoove', {
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
      expect(getRentalNetworkConfig('foobar', config)).to.equal(
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
      expect(getRentalNetworkConfig('Foobar', config)).to.equal(
        config.cityBike.networks.foobar,
      );
    });
  });

  describe('getRentalNetworkIcon', () => {
    it('should default to "icon-icon_citybike"', () => {
      const result = getRentalNetworkIcon();
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should default to "icon-icon_citybike" if no icon has been defined', () => {
      const networkConfig = {
        icon: undefined,
      };
      const result = getRentalNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should return the given icon', () => {
      const networkConfig = {
        icon: 'foobar',
      };
      const result = getRentalNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_foobar');
    });
  });

  describe('getRentalNetworkName', () => {
    it('should default to undefined', () => {
      const result = getRentalNetworkName();
      expect(result).to.equal(undefined);
    });

    it('should return undefined if no matching language term exists', () => {
      const networkConfig = { name: { en: 'Test' } };
      const language = 'sv';
      const result = getRentalNetworkName(networkConfig, language);
      expect(result).to.equal(undefined);
    });

    it('should pick the name for the given language', () => {
      const networkConfig = { name: { fi: 'Testi' } };
      const language = 'fi';
      const result = getRentalNetworkName(networkConfig, language);
      expect(result).to.equal('Testi');
    });
  });
});
