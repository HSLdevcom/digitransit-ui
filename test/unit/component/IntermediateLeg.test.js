import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IntermediateLeg from '../../../app/component/itinerary/IntermediateLeg';
import ZoneIcon from '../../../app/component/ZoneIcon';

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
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(2);
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
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-triple')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(3);
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
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(0);
  });

  it('should apply class zone-previous when there is a current zone and a previous zone', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      previousZoneId: 'baz',
      showZoneLimits: true,
      gtfsId: 'foo:1',
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { feedIds: ['foo'], colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-previous')).to.have.lengthOf(1);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(2);
  });

  it('should not show any zone limit information if disabled', () => {
    const props = {
      ...emptyProps,
      currentZoneId: 'foo',
      nextZoneId: 'bar',
      previousZoneId: 'baz',
      showZoneLimits: false,
    };
    const wrapper = shallowWithIntl(<IntermediateLeg {...props} />, {
      context: { config: { colors: { primary: '#007ac9' } } },
    });
    expect(wrapper.find('.zone-dual')).to.have.lengthOf(0);
    expect(wrapper.find('.zone-triple')).to.have.lengthOf(0);
    expect(wrapper.find('.zone-previous')).to.have.lengthOf(0);
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });
});
