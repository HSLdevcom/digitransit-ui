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
      expect(getRentalNetworkId(undefined)).toBe(undefined);
      expect(getRentalNetworkId([])).toBe(undefined);
    });

    it('should pick the first networkId', () => {
      const networks = ['Samocat', 'Smoove'];
      expect(getRentalNetworkId(networks)).toBe('Samocat');
    });

    it('should also accept an input string', () => {
      const networks = 'Samocat';
      expect(getRentalNetworkId(networks)).toBe('Samocat');
    });
  });

  describe('getRentalNetworkId', () => {
    it('should default to a default config', () => {
      expect(getRentalNetworkConfig(undefined, {})).toBe(defaultNetworkConfig);
      expect(getRentalNetworkConfig('Smoove', {})).toBe(defaultNetworkConfig);
      expect(getRentalNetworkConfig('Smoove', { vehicleRental: {} })).toBe(
        defaultNetworkConfig,
      );
      expect(
        getRentalNetworkConfig('Smoove', {
          vehicleRental: { networks: {} },
        }),
      ).toBe(defaultNetworkConfig);
      expect(
        getRentalNetworkConfig('Smoove', {
          vehicleRental: { networks: { smoove: {} } },
        }),
      ).toBe(defaultNetworkConfig);
    });

    it('should return the configuration by the given network id', () => {
      const config = {
        vehicleRental: {
          networks: {
            foobar: {
              icon: 'citybike',
              type: 'scooter',
            },
          },
        },
      };
      expect(getRentalNetworkConfig('foobar', config)).toBe(
        config.vehicleRental.networks.foobar,
      );
    });

    it('should convert networkId to lowercase', () => {
      const config = {
        vehicleRental: {
          networks: {
            foobar: {
              icon: 'citybike',
              type: 'scooter',
            },
          },
        },
      };
      expect(getRentalNetworkConfig('Foobar', config)).toBe(
        config.vehicleRental.networks.foobar,
      );
    });
  });

  describe('getRentalNetworkIcon', () => {
    it('should default to "icon_citybike"', () => {
      const result = getRentalNetworkIcon();
      expect(result).toBe('icon_citybike');
    });

    it('should default to "icon_citybike" if no icon has been defined', () => {
      const networkConfig = {
        icon: undefined,
      };
      const result = getRentalNetworkIcon(networkConfig);
      expect(result).toBe('icon_citybike');
    });

    it('should return the given icon', () => {
      const networkConfig = {
        icon: 'foobar',
      };
      const result = getRentalNetworkIcon(networkConfig);
      expect(result).toBe('icon_foobar');
    });
  });

  describe('getRentalNetworkName', () => {
    it('should default to undefined', () => {
      const result = getRentalNetworkName();
      expect(result).toBe(undefined);
    });

    it('should return undefined if no matching language term exists', () => {
      const networkConfig = { name: { en: 'Test' } };
      const language = 'sv';
      const result = getRentalNetworkName(networkConfig, language);
      expect(result).toBe(undefined);
    });

    it('should pick the name for the given language', () => {
      const networkConfig = { name: { fi: 'Testi' } };
      const language = 'fi';
      const result = getRentalNetworkName(networkConfig, language);
      expect(result).toBe('Testi');
    });
  });
});
