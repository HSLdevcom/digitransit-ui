import {
  defaultNetworkConfig,
  getVehicleRentalStationNetworkId,
  getVehicleRentalStationNetworkIcon,
  getVehicleRentalStationNetworkName,
  getVehicleRentalStationNetworkConfig,
} from '../../../app/util/vehicleRentalUtils';

describe('vehiclerental', () => {
  describe('getVehicleRentalStationNetworkId', () => {
    it('should default to undefined', () => {
      expect(getVehicleRentalStationNetworkId(undefined)).to.equal(undefined);
      expect(getVehicleRentalStationNetworkId([])).to.equal(undefined);
    });

    it('should pick the first networkId', () => {
      const networks = ['Samocat', 'Smoove'];
      expect(getVehicleRentalStationNetworkId(networks)).to.equal('Samocat');
    });

    it('should also accept an input string', () => {
      const networks = 'Samocat';
      expect(getVehicleRentalStationNetworkId(networks)).to.equal('Samocat');
    });
  });

  describe('getVehicleRentalStationNetworkId', () => {
    it('should default to a default config', () => {
      expect(getVehicleRentalStationNetworkConfig(undefined, {})).to.equal(
        defaultNetworkConfig,
      );
      expect(getVehicleRentalStationNetworkConfig('Smoove', {})).to.equal(
        defaultNetworkConfig,
      );
      expect(
        getVehicleRentalStationNetworkConfig('Smoove', { cityBike: {} }),
      ).to.equal(defaultNetworkConfig);
      expect(
        getVehicleRentalStationNetworkConfig('Smoove', {
          cityBike: { networks: {} },
        }),
      ).to.equal(defaultNetworkConfig);
      expect(
        getVehicleRentalStationNetworkConfig('Smoove', {
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
      expect(getVehicleRentalStationNetworkConfig('foobar', config)).to.equal(
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
      expect(getVehicleRentalStationNetworkConfig('Foobar', config)).to.equal(
        config.cityBike.networks.foobar,
      );
    });
  });

  describe('getVehicleRentalStationNetworkIcon', () => {
    it('should default to "icon-icon_citybike"', () => {
      const result = getVehicleRentalStationNetworkIcon();
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should default to "icon-icon_citybike" if no icon has been defined', () => {
      const networkConfig = {
        icon: undefined,
      };
      const result = getVehicleRentalStationNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should return the given icon', () => {
      const networkConfig = {
        icon: 'foobar',
      };
      const result = getVehicleRentalStationNetworkIcon(networkConfig);
      expect(result).to.equal('icon-icon_foobar');
    });
  });

  describe('getVehicleRentalStationNetworkName', () => {
    it('should default to undefined', () => {
      const result = getVehicleRentalStationNetworkName();
      expect(result).to.equal(undefined);
    });

    it('should return undefined if no matching language term exists', () => {
      const networkConfig = { name: { en: 'Test' } };
      const language = 'sv';
      const result = getVehicleRentalStationNetworkName(
        networkConfig,
        language,
      );
      expect(result).to.equal(undefined);
    });

    it('should pick the name for the given language', () => {
      const networkConfig = { name: { fi: 'Testi' } };
      const language = 'fi';
      const result = getVehicleRentalStationNetworkName(
        networkConfig,
        language,
      );
      expect(result).to.equal('Testi');
    });
  });
});
