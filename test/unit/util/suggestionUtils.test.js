import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { getNameLabel } from '../../../app/util/suggestionUtils';

const testdata = {
  stop: {
    accuracy: 'centroid',
    confidence: 0.542497680890538,
    country: 'Suomi',
    country_a: 'FIN',
    country_gid: 'whosonfirst:country:85633143',
    gid: 'gtfshsl:stop:GTFS:HSL:1293163#1636',
    id: 'GTFS:HSL:1293163#1636',
    label: 'Teuvo Pakkalan tie 1636, Pohjois-Haaga, Helsinki',
    layer: 'stop',
    localadmin: 'Helsinki',
    localadmin_gid: 'whosonfirst:localadmin:907199715',
    locality: 'Helsinki',
    locality_gid: 'whosonfirst:locality:101748417',
    name: 'Teuvo Pakkalan tie 1636',
    neighbourhood: 'Pohjois-Haaga',
    neighbourhood_gid: 'whosonfirst:neighbourhood:85907969',
    postalcode: '00400',
    postalcode_gid: 'whosonfirst:postalcode:421473047',
    region: 'Uusimaa',
    region_gid: 'whosonfirst:region:85683067',
    source: 'gtfshsl',
    source_id: 'gtfs:hsl:1293163#1636',
  },
};

describe('suggestionUtils', () => {
  describe('getNameLabel', () => {
    it('should include locality in jsx-formatted gtfs stop label', () => {
      const label = getNameLabel(testdata.stop, false);
      const wrapper = shallowWithIntl(label[1], {});
      expect(wrapper.find('span').text()).to.have.string('Helsinki');
    });

    it('should include locality in plaintext gtfs stop label', () => {
      const label = getNameLabel(testdata.stop, true);
      expect(label[1]).to.equal('Helsinki');
    });

    it('should include agency in the plaintext for routes', () => {
      const properties = {
        agency: {
          name: 'Tampereen joukkoliikenne',
        },
        layer: 'route-BUS',
        longName: 'TAYS - Hervanta - Hatanpää-Tampella',
        shortName: '32',
      };

      const label = getNameLabel(properties, true);
      expect(label).to.deep.equal([
        '32',
        'TAYS - Hervanta - Hatanpää-Tampella',
        'Tampereen joukkoliikenne',
      ]);
    });

    it('should ignore a missing agency in the plaintext for routes', () => {
      const properties = {
        agency: null,
        layer: 'route-BUS',
        longName: 'TAYS - Hervanta - Hatanpää-Tampella',
        shortName: '32',
      };

      const label = getNameLabel(properties, true);
      expect(label).to.deep.equal([
        '32',
        'TAYS - Hervanta - Hatanpää-Tampella',
        undefined,
      ]);
    });
  });
});
