import { getCityBikeNetworkIcon } from '../../../app/util/citybikes';

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
});
