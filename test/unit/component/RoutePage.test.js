import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { startRealTimeClient } from '../../../app/action/realTimeClientAction';
import { Component as RoutePage } from '../../../app/component/RoutePage';
import { AlertSeverityLevelType } from '../../../app/constants';
import Icon from '../../../app/component/Icon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../app/util/path';

describe('<RoutePage />', () => {
  it('should set the activeAlert class if there is an alert and no patternId', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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
        pathname: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:1:01`,
      },
      params: {
        patternId: 'tampere:32:1:01',
      },
      route: {
        gtfsId: 'tampere:32',
        mode: 'BUS',
        patterns: [{ code: 'tampere:32:1:01', headsign: 'Tampella' }],
      },
    };
    const context = {
      ...mockContext,
      config: {
        realTime: {
          tampere: {
            gtfsRt: 'foobar',
            routeSelector: () => '32',
            active: true,
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

  it('should not start the real time client after mounting if realtime is not active', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:1:01`,
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
            active: false,
          },
        },
      },
      executeAction: sinon.stub(),
    };

    shallowWithIntl(<RoutePage {...props} />, {
      context,
    });

    expect(context.executeAction.callCount).to.equal(0);
  });

  it('should set the activeAlert class if there is a cancelation for today', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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

  it('should set the activeAlert class if one of the stops in this pattern has an alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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
            stops: [
              {
                alerts: [
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Warning,
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

  it('should set the activeAlert class if there are alerts for the current route with and without pattern information', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
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
            id: 'foobar',
          },
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
    expect(wrapper.find('.activeAlert')).to.have.lengthOf(1);
  });

  describe('componentDidMount', () => {
    it('should ignore a missing pattern', () => {
      const props = {
        breakpoint: 'large',
        location: {
          pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:02`,
        },
        params: {
          routeId: 'HSL:1063',
          patternId: 'HSL:1063:0:02',
        },
        route: {
          gtfsId: 'HSL:1063',
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:1063:0:01',
            },
          ],
        },
      };
      const wrapper = shallowWithIntl(<RoutePage {...props} />, {
        context: {
          ...mockContext,
          config: { realTime: { HSL: { active: true } } },
        },
      });
      wrapper.instance().componentDidMount();
    });
  });

  describe('onPatternChange', () => {
    it('should ignore a missing pattern', () => {
      const props = {
        breakpoint: 'large',
        location: {
          pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:02`,
        },
        params: {
          routeId: 'HSL:1063',
          patternId: 'HSL:1063:0:01',
        },
        route: {
          gtfsId: 'HSL:1063',
          mode: 'BUS',
          patterns: [
            {
              code: 'HSL:1063:0:01',
            },
          ],
        },
      };
      const wrapper = shallowWithIntl(<RoutePage {...props} />, {
        context: {
          ...mockContext,
          config: {
            realTime: { HSL: { active: true, routeSelector: () => '63' } },
          },
          getStore: () => ({ client: {} }),
        },
      });
      wrapper.instance().onPatternChange('foobar');
    });
  });

  it('should mark the disruptions tab as having an active info alert due to a route INFO level service alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        alerts: [
          { id: 'foobar', alertSeverityLevel: AlertSeverityLevelType.Info },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(
      wrapper
        .find(Icon)
        .at(2)
        .props().className,
    ).to.equal('route-page-tab_icon active-service-alert');
  });

  it('should mark the disruptions tab as having an active info alert due to a route WARNING level service alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        alerts: [
          { id: 'foobar', alertSeverityLevel: AlertSeverityLevelType.Warning },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(
      wrapper
        .find(Icon)
        .at(2)
        .props().className,
    ).to.equal('route-page-tab_icon active-disruption-alert');
  });

  it('should mark the disruptions tab as having an active info alert due to a route SEVERE level service alert', () => {
    const props = {
      breakpoint: 'large',
      location: {
        pathname: `/${PREFIX_ROUTES}/HSL:1063/${PREFIX_STOPS}/HSL:1063:0:01`,
      },
      params: {
        routeId: 'HSL:1063',
        patternId: 'HSL:1063:0:01',
      },
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        alerts: [
          { id: 'foobar', alertSeverityLevel: AlertSeverityLevelType.Severe },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RoutePage {...props} />, {
      context: { ...mockContext },
    });
    expect(
      wrapper
        .find(Icon)
        .at(2)
        .props().className,
    ).to.equal('route-page-tab_icon active-disruption-alert');
  });
});
