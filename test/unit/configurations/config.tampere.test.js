import { describe, it } from 'mocha';
import { expect } from 'chai';

import tampereConfig from '../../../app/configurations/config.tampere';

describe('tampere configuration', () => {
  describe.skip('realTime', () => {
    it('routeSelector should map the given props to something', () => {
      const props = {
        route: {
          shortName: 'foobar',
        },
      };
      const result = tampereConfig.realTime.tampere.routeSelector(props);
      expect(result).to.equal('foobar');
    });
  });

  describe('fareMapping', () => {
    it('should return an empty string for a missing fareId', () => {
      const result = tampereConfig.fareMapping(undefined, 'fi');
      expect(result).to.equal('');
    });

    it('should return an empty string for a missing index', () => {
      const result = tampereConfig.fareMapping('tampere:F', 'fi');
      expect(result).to.equal('');
    });

    it('should return 2 zones depending on the fareId', () => {
      expect(tampereConfig.fareMapping('tampere:F5', 'fi')).to.equal(
        'Kertalippu, kaksi vyöhykettä',
      );
    });

    it('should return 3 zones depending on the fareId', () => {
      expect(tampereConfig.fareMapping('tampere:F9', 'fi')).to.equal(
        'Kertalippu, kolme vyöhykettä',
      );
    });

    it('should return 4 zones depending on the fareId', () => {
      expect(tampereConfig.fareMapping('tampere:F12', 'fi')).to.equal(
        'Kertalippu, neljä vyöhykettä',
      );
    });

    it('should return 5 zones depending on the fareId', () => {
      expect(tampereConfig.fareMapping('tampere:F14', 'fi')).to.equal(
        'Kertalippu, viisi vyöhykettä',
      );
    });

    it('should return 6 zones depending on the fareId', () => {
      expect(tampereConfig.fareMapping('tampere:F15', 'fi')).to.equal(
        'Kertalippu, kuusi vyöhykettä',
      );
    });

    it('should return an English text', () => {
      expect(tampereConfig.fareMapping('tampere:F1', 'en')).to.equal(
        'Single ticket, two zones',
      );
    });

    it('should return a Swedish text', () => {
      expect(tampereConfig.fareMapping('tampere:F1', 'sv')).to.equal(
        'Enkelbiljett, två zoner',
      );
    });
  });
});
