import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkName,
} from '../../../app/util/citybikes';

describe('citybikes', () => {
  describe('getCityBikeNetworkIcon', () => {
    it('should default to "icon-icon_citybike" if the networks are falsy', () => {
      const result = getCityBikeNetworkIcon(undefined);
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should default to "icon-icon_citybike" if no matching network is found', () => {
      const result = getCityBikeNetworkIcon(['foobar']);
      expect(result).to.equal('icon-icon_citybike');
    });

    it('should pick the first network', () => {
      const networks = ['Samocat', 'Smoove'];
      const result = getCityBikeNetworkIcon(networks);
      expect(result).to.equal('icon-icon_scooter');
    });
  });

  describe('getCityBikeNetworkName', () => {
    it('should default to "citybike" if the networks are falsy', () => {
      const result = getCityBikeNetworkName(undefined);
      expect(result).to.equal('citybike');
    });

    it('should default to "citybike" if no matching network is found', () => {
      const result = getCityBikeNetworkName(['foobar']);
      expect(result).to.equal('citybike');
    });

    it('should pick the first network', () => {
      const networks = ['Samocat', 'Smoove'];
      const result = getCityBikeNetworkName(networks);
      expect(result).to.equal('scooter');
    });
  });
});
