import React from 'react';
import { render } from '@testing-library/react';
import PointFeatureMarker, {
  CUSTOM_ICON_MIN_ZOOM,
  CUSTOM_ICON_SIZE,
  getCustomIcon,
  getPropertyValueOrDefault,
  getRoundIcon,
  getPopupHeaderValues,
} from '../../../../app/component/map/PointFeatureMarker';

describe('<PointFeatureMarker />', () => {
  it('should render empty if the geometry type is not Point', () => {
    const props = {
      feature: {
        geometry: {
          coordinates: [
            [1, 2],
            [2, 3],
          ],
          type: 'MultiPoint',
        },
        properties: {},
      },
      language: 'fi',
    };
    const { container } = render(<PointFeatureMarker {...props} />);
    expect(container.innerHTML).toBe('');
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
    expect(getPopupHeaderValues(props.feature, props.language)).toEqual({
      header: 'foobar',
      subHeader: 'baz',
    });
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
    expect(getPopupHeaderValues(props.feature, props.language)).toEqual({
      header: 'foo, bar',
      subHeader: '',
    });
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
    expect(getPopupHeaderValues(props.feature, props.language)).toEqual({
      header: 'baz',
      subHeader: 'foo, bar',
    });
  });

  describe('getPropertyValueOrDefault', () => {
    it('should return the defaultValue if properties is falsey', () => {
      expect(getPropertyValueOrDefault(undefined, 'foo', 'fi', 'bar')).toBe(
        'bar',
      );
    });

    it('should return the defaultValue if propertyName is falsey', () => {
      expect(
        getPropertyValueOrDefault({ foo: 'bar' }, undefined, 'fi', 'baz'),
      ).toBe('baz');
    });

    it('should return the value of the non-translated property if it exists and the language is falsey', () => {
      expect(
        getPropertyValueOrDefault({ foo: 'bar' }, 'foo', undefined, 'baz'),
      ).toBe('bar');
    });

    it('should return the value of the translated property if it exists for the given language', () => {
      expect(
        getPropertyValueOrDefault({ foo_fi: 'bar' }, 'foo', 'fi', 'baz'),
      ).toBe('bar');
    });

    it('should return the defaultValue if the property has no value', () => {
      expect(
        getPropertyValueOrDefault({ foo_fi: undefined }, 'foo', 'fi', 'baz'),
      ).toBe('baz');
    });
  });

  describe('getRoundIcon', () => {
    it('should return an svg icon with a non-zero radius', () => {
      const icon = getRoundIcon(12);
      expect(icon.options.html).toContain('svg');
      expect(icon.options.iconSize).toEqual([3, 3]);
    });
  });

  describe('getCustomIcon', () => {
    it('should return a scaled custom icon', () => {
      const icon = getCustomIcon(CUSTOM_ICON_MIN_ZOOM, 'foobar', 20);
      expect(icon.options.iconAnchor[0]).toBe(
        (icon.options.iconSize[0] * 1) / 2,
      );
      expect(icon.options.iconAnchor[0]).toBe(icon.options.iconAnchor[1]);
      expect(icon.options.iconSize[0]).toBeGreaterThanOrEqual(CUSTOM_ICON_SIZE);
      expect(icon.options.iconSize[0]).toBe(icon.options.iconSize[1]);
      expect(icon.options.iconUrl).toBe('foobar');
    });
  });
});
