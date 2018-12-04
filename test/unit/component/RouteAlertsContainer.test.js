import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as RouteAlertsContainer } from '../../../app/component/RouteAlertsContainer';

describe('<RouteAlertsContainer />', () => {
  it('should indicate that there are no alerts if the alerts array is empty', () => {
    const props = {
      route: {
        alerts: [],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.no-alerts-message')).to.have.lengthOf(1);
  });

  it('should indicate that there are no alerts if the alerts array does not have an alert for the current patternId', () => {
    const props = {
      patternId: 'HSL:1063:0:01',
      route: {
        mode: 'BUS',
        alerts: [
          {
            trip: {
              pattern: {
                code: 'HSL:1063:1:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.no-alerts-message')).to.have.lengthOf(1);
  });
});
