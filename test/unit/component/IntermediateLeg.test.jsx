import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import IntermediateLeg from '../../../app/component/itinerary/IntermediateLeg';

const emptyProps = {
  arrival: { scheduledTime: '2024-04-05T14:48:00.000Z' },
  name: '',
  mode: '',
  stopCode: '',
  focusFunction: () => {},
};

describe('<IntermediateLeg />', () => {
  it('should apply class zone-dual for dual zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const { container } = renderWithProviders(<IntermediateLeg {...props} />, {
      config: {
        CONFIG: 'default',
        feedIds: ['foo'],
        colors: { primary: '#007ac9' },
      },
    });
    expect(container.querySelectorAll('.zone-dual')).toHaveLength(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).toHaveLength(2);
  });

  it('should apply class zone-triple for triple zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const { container } = renderWithProviders(<IntermediateLeg {...props} />, {
      config: {
        CONFIG: 'default',
        feedIds: ['foo'],
        colors: { primary: '#007ac9' },
      },
    });
    expect(container.querySelectorAll('.zone-triple')).toHaveLength(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).toHaveLength(3);
  });

  it('should not apply class zone-dual for triple zones', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const { container } = renderWithProviders(<IntermediateLeg {...props} />, {
      config: {
        CONFIG: 'default',
        feedIds: ['foo'],
        colors: { primary: '#007ac9' },
      },
    });
    expect(container.querySelectorAll('.zone-dual')).toHaveLength(0);
  });

  it('should apply class zone-previous when there is a current zone and a previous zone', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const { container } = renderWithProviders(<IntermediateLeg {...props} />, {
      config: {
        CONFIG: 'default',
        feedIds: ['foo'],
        colors: { primary: '#007ac9' },
      },
    });
    expect(container.querySelectorAll('.zone-previous')).toHaveLength(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).toHaveLength(2);
  });

  it('should not show any zone limit information if disabled', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: false,
    };
    const { container } = renderWithProviders(<IntermediateLeg {...props} />, {
      config: { CONFIG: 'default', colors: { primary: '#007ac9' } },
    });
    expect(container.querySelectorAll('.zone-dual')).toHaveLength(0);
    expect(container.querySelectorAll('.zone-triple')).toHaveLength(0);
    expect(container.querySelectorAll('.zone-previous')).toHaveLength(0);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container'),
    ).toHaveLength(0);
  });
});
