import { expect } from 'chai';
import { describe, it } from 'mocha';
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
    expect(container.querySelectorAll('.zone-dual')).to.have.lengthOf(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).to.have.lengthOf(2);
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
    expect(container.querySelectorAll('.zone-triple')).to.have.lengthOf(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).to.have.lengthOf(3);
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
    expect(container.querySelectorAll('.zone-dual')).to.have.lengthOf(0);
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
    expect(container.querySelectorAll('.zone-previous')).to.have.lengthOf(1);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container .circle'),
    ).to.have.lengthOf(2);
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
    expect(container.querySelectorAll('.zone-dual')).to.have.lengthOf(0);
    expect(container.querySelectorAll('.zone-triple')).to.have.lengthOf(0);
    expect(container.querySelectorAll('.zone-previous')).to.have.lengthOf(0);
    expect(
      container.querySelectorAll('.time-column-zone-icons-container'),
    ).to.have.lengthOf(0);
  });
});
