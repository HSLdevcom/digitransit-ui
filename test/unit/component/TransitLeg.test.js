import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import TransitLeg from '../../../app/component/TransitLeg';
import IntermediateLeg from '../../../app/component/IntermediateLeg';
import {
  RealtimeStateType,
  AlertSeverityLevelType,
} from '../../../app/constants';
import RouteNumber from '../../../app/component/RouteNumber';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';

const defaultProps = {
  children: <div />,
  focusAction: () => {},
  index: 0,
};

describe('<TransitLeg />', () => {
  it('should show a zone change between from and the first intermediate place', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {
            zoneId: 'A',
          },
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showCurrentZoneDelimiter).to.equal(true);
    expect(leg.props().previousZoneId).to.equal('A');
    expect(leg.props().currentZoneId).to.equal('B');
    expect(leg.props().nextZoneId).to.equal(undefined);
  });

  it('should show a zone change between intermediate places', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
          {
            arrivalTime: 1540990440000,
            stop: {
              gtfsId: 'HSL:2131251',
              name: 'Nihtisilta',
              code: 'E1313',
              zoneId: 'C',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const legs = wrapper.find(IntermediateLeg);
    expect(legs).to.have.lengthOf(2);
    expect(legs.at(0).props().showCurrentZoneDelimiter).to.equal(false);
    expect(legs.at(0).props().previousZoneId).to.equal(undefined);
    expect(legs.at(0).props().currentZoneId).to.equal('B');
    expect(legs.at(0).props().nextZoneId).to.equal(undefined);
    expect(legs.at(1).props().showCurrentZoneDelimiter).to.equal(true);
    expect(legs.at(1).props().previousZoneId).to.equal(undefined);
    expect(legs.at(1).props().currentZoneId).to.equal('C');
    expect(legs.at(1).props().nextZoneId).to.equal(undefined);
  });

  it('should show a zone change between the last intermediate place and to', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showCurrentZoneDelimiter).to.equal(false);
    expect(leg.props().previousZoneId).to.equal(undefined);
    expect(leg.props().currentZoneId).to.equal('B');
    expect(leg.props().nextZoneId).to.equal('C');
  });

  it('should not show any zone changes if the feature is disabled', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: false,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });
    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showZoneLimits).to.equal(false);
  });

  it('should toggle showIntermediateStops', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });

    wrapper.instance().toggleShowIntermediateStops();
    expect(wrapper.state('showIntermediateStops')).to.equal(true);

    wrapper.instance().toggleShowIntermediateStops();
    expect(wrapper.state('showIntermediateStops')).to.equal(false);
  });

  it('should apply isCanceled to an intermediate leg', () => {
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Huopalahti',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540989970000,
            stop: {
              code: '007',
              gtfsId: 'stop1',
              name: 'Ilmala',
            },
          },
        ],
        route: {
          gtfsId: 'A',
        },
        startTime: 1540989960000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
          stoptimes: [
            {
              realtimeState: RealtimeStateType.Canceled,
              stop: { gtfsId: 'stop1' },
            },
          ],
        },
      },
      mode: 'RAIL',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {},
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });
    expect(wrapper.find(IntermediateLeg).prop('isCanceled')).to.equal(true);
  });

  it('should apply alertSeverityLevel due to a route alert', () => {
    const props = {
      ...defaultProps,
      leg: {
        endTime: 1553856420000,
        from: {
          name: 'Testilahti',
          stop: {},
        },
        intermediatePlaces: [],
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
            },
          ],
          gtfsId: 'A',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(RouteNumber).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a trip alert', () => {
    const props = {
      ...defaultProps,
      leg: {
        endTime: 1553856420000,
        from: {
          name: 'Testilahti',
          stop: {},
        },
        intermediatePlaces: [],
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              trip: {
                pattern: {
                  code: 'A',
                },
              },
            },
          ],
          gtfsId: 'A',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(RouteNumber).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a stop alert at the "from" stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        endTime: 1553856420000,
        from: {
          name: 'Testilahti',
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
              },
            ],
          },
        },
        intermediatePlaces: [],
        route: {
          gtfsId: 'A',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(RouteNumber).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a stop alert at the "to" stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        endTime: 1553856420000,
        from: {
          name: 'Testilahti',
          stop: {},
        },
        intermediatePlaces: [],
        route: {
          gtfsId: 'A',
        },
        startTime: 1553856180000,
        to: {
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
              },
            ],
          },
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(RouteNumber).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a stop alert at an intermediate stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        endTime: 1553856420000,
        from: {
          name: 'Testilahti',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1553856410,
            stop: {
              gtfsId: 'foobar',
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                },
              ],
            },
          },
        ],
        route: {
          gtfsId: 'A',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(RouteNumber).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should show a disclaimer with relevant information for an unknown ticket', () => {
    const props = {
      ...defaultProps,
      leg: {
        fare: {
          isUnknown: true,
          agency: {
            name: 'foogency',
            fareUrl: 'https://www.hsl.fi',
          },
        },
        from: {
          name: 'Test',
          stop: {},
        },
        intermediatePlaces: [],
        route: {
          gtfsId: '1234',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A1234',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {},
          showTicketInformation: true,
          availableTickets: { HSL: { 'HSL:A': { price: 5.5, zones: ['A'] } } },
          feedIds: ['HSL', 'HSLlautta'],
        },
        focusFunction: () => {},
      },
    });
    expect(wrapper.find('.disclaimer-container')).to.have.lengthOf(1);
    expect(wrapper.find('.agency-link')).to.have.lengthOf(1);
  });

  it('should not show a disclaimer for an unknown ticket when there is nothing for feedIds in availableTickets', () => {
    const props = {
      ...defaultProps,
      leg: {
        fare: {
          isUnknown: true,
          agency: {
            name: 'foogency',
            fareUrl: 'https://www.hsl.fi',
          },
        },
        from: {
          name: 'Test',
          stop: {},
        },
        intermediatePlaces: [],
        route: {
          gtfsId: '1234',
        },
        startTime: 1553856180000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A1234',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {},
          showTicketInformation: true,
          availableTickets: { HSL: { 'foo:A': { price: 5.5, zones: ['A'] } } },
          feedIds: ['HSL', 'HSLlautta'],
        },
        focusFunction: () => {},
      },
    });
    expect(wrapper.find('.disclaimer-container')).to.have.lengthOf(1);
    expect(wrapper.find('.agency-link')).to.have.lengthOf(1);
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 123456789;
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Test',
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: startTime + 1,
                effectiveStartDate: startTime - 1,
              },
            ],
          },
        },
        intermediatePlaces: [],
        route: {
          gtfsId: 'A1234',
        },
        startTime: startTime * 1000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'A1234:01',
          pattern: {
            code: 'A',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: { config: { itinerary: {} }, focusFunction: () => {} },
    });
    expect(wrapper.find(ServiceAlertIcon).prop('severityLevel')).to.equal(
      AlertSeverityLevelType.Info,
    );
  });
});
