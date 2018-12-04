import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as RoutePage } from '../../../app/component/RoutePage';

describe('<RoutePage />', () => {
  it('should set the activeAlert class if there is an alert and no patternId', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: '/linjat/HSL:1063/pysakit/HSL:1063:0:01',
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        alerts: [{ id: 'foobar' }],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  it('should set the activeAlert class if there is an alert and a matching patternId', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: '/linjat/HSL:1063/pysakit/HSL:1063:0:01',
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        alerts: [
          {
            trip: {
              pattern: {
                code: 'HSL:1063:0:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  it('should not set the activeAlert class if there is an alert and no matching patternId', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: '/linjat/HSL:1063/pysakit/HSL:1063:0:01',
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
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
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(0);
  });
});
