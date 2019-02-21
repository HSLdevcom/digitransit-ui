import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { startRealTimeClient } from '../../../app/action/realTimeClientAction';
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

  it('should start the real time client after mounting', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: '/linjat/tampere:32/pysakit/tampere:32:1:01',
      },
      params: {
        patternId: 'tampere:32:1:01',
      },
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
      },
    };
    const context = {
      ...mockContext,
      config: {
        realTime: {
          tampere: {
            gtfsRt: 'foobar',
            routeSelector: () => '32',
          },
        },
      },
      executeAction: sinon.stub(),
    };

    shallowWithIntl(<RoutePage {...props} />, {
      context,
    });

    expect(context.executeAction.callCount).to.equal(1);
    expect(context.executeAction.args[0][0]).to.equal(startRealTimeClient);
  });

  it('should set the activeAlert if there is a cancelation for today', () => {
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
        alerts: [],
        patterns: [
          {
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'CANCELED',
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });
});
