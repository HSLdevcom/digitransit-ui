import React from 'react';

import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import CardHeader from '../../../../app/component/CardHeader';
import {
  Component as PointFeatureMarker,
  CUSTOM_ICON_MIN_ZOOM,
  CUSTOM_ICON_SIZE,
  getCustomIcon,
  getPropertyValueOrDefault,
  getRoundIcon,
} from '../../../../app/component/map/PointFeatureMarker';

describe('<PointFeatureMarker />', () => {
  it('should render', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [60, 25],
          type: 'Point',
        },
        properties: {
          address: 'Foostreet 11',
          city: 'Baz',
          name: 'Foobar',
        },
      },
      language: 'fi',
    };
    const wrapper = shallowWithIntl(<PointFeatureMarker {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it('should render empty if the geometry type is not Point', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [[1, 2], [2, 3]],
          type: 'MultiPoint',
        },
        properties: {},
      },
      language: 'fi',
    };
    const wrapper = shallowWithIntl(<PointFeatureMarker {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should use the name property as header', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [60, 25],
          type: 'Point',
        },
        properties: {
          address: 'baz',
          name: 'foobar',
        },
      },
      language: 'fi',
    };
    const wrapper = shallowWithIntl(<PointFeatureMarker {...props} />);
    expect(wrapper.find(CardHeader).props().name).to.equal('foobar');
  });

  it('should use the address and city properties as header', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [60, 25],
          type: 'Point',
        },
        properties: {
          address: 'foo',
          city: 'bar',
        },
      },
      language: 'fi',
    };
    const wrapper = shallowWithIntl(<PointFeatureMarker {...props} />);
    expect(wrapper.find(CardHeader).props().name).to.equal('foo, bar');
  });

  it('should use the address and city properties as description', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [60, 25],
          type: 'Point',
        },
        properties: {
          address: 'foo',
          city: 'bar',
          name: 'baz',
        },
      },
      language: 'fi',
    };
    const wrapper = shallowWithIntl(<PointFeatureMarker {...props} />);
    expect(wrapper.find(CardHeader).props().description).to.equal('foo, bar');
  });

  describe('getPropertyValueOrDefault', () => {
    it('should return the defaultValue if properties is falsey', () => {
      expect(getPropertyValueOrDefault(undefined, 'foo', 'fi', 'bar')).to.equal(
        'bar',
      );
    });

    it('should return the defaultValue if propertyName is falsey', () => {
      expect(
        getPropertyValueOrDefault({ foo: 'bar' }, undefined, 'fi', 'baz'),
      ).to.equal('baz');
    });

    it('should return the value of the non-translated property if it exists and the language is falsey', () => {
      expect(
        getPropertyValueOrDefault({ foo: 'bar' }, 'foo', undefined, 'baz'),
      ).to.equal('bar');
    });

    it('should return the value of the translated property if it exists for the given language', () => {
      expect(
        getPropertyValueOrDefault({ foo_fi: 'bar' }, 'foo', 'fi', 'baz'),
      ).to.equal('bar');
    });

    it('should return the defaultValue if the property has no value', () => {
      expect(
        getPropertyValueOrDefault({ foo_fi: undefined }, 'foo', 'fi', 'baz'),
      ).to.equal('baz');
    });
  });

  describe('getRoundIcon', () => {
    it('should return an svg icon with a non-zero radius', () => {
      const icon = getRoundIcon(12);
      expect(icon.options.html).to.contain('svg');
      expect(icon.options.iconSize).to.deep.equal([3, 3]);
    });
  });

  describe('getCustomIcon', () => {
    it('should return a scaled custom icon', () => {
      const icon = getCustomIcon(CUSTOM_ICON_MIN_ZOOM, 'foobar');
      expect(icon.options.iconAnchor[0]).to.equal(
        icon.options.iconSize[0] * 1 / 2,
      );
      expect(icon.options.iconAnchor[0]).to.equal(icon.options.iconAnchor[1]);
      expect(icon.options.iconSize[0]).to.be.at.least(CUSTOM_ICON_SIZE);
      expect(icon.options.iconSize[0]).to.equal(icon.options.iconSize[1]);
      expect(icon.options.iconUrl).to.equal('foobar');
    });
  });
});
