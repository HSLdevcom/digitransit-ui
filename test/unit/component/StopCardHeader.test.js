import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import StopCardHeader from '../../../app/component/StopCardHeader';
import ZoneIcon from '../../../app/component/ZoneIcon';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<StopCardHeader />', () => {
  it('should not render the zone icon if zoneId is missing', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: null,
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: true,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should not render the zone icon if so configured', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: false,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should render the zone icon', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: true,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(1);
  });
});
