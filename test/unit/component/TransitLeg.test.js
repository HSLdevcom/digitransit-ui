import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as TransitLeg } from '../../../app/component/TransitLeg';
import IntermediateLeg from '../../../app/component/IntermediateLeg';
import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { mockContext } from '../helpers/mock-context';
import LegInfo from '../../../app/component/LegInfo';

const defaultProps = {
  children: <div />,
  interliningLegs: [],
  focusAction: () => {},
  index: 0,
  lang: 'fi',
};

const config = {
  CONFIG: 'hsl',
  itinerary: {},
  zones: { itinerary: true },
  feedIds: ['HSL'],
  colors: { primary: 'ffffff' },
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
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540990260000).toISOString() },
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
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
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
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540990260000).toISOString() },
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
          {
            arrival: { scheduledtime: new Date(1540990440000).toISOString() },
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
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
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
          stop: {
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540990260000).toISOString() },
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
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
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
          stop: {
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540990260000).toISOString() },
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
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          zones: { itinerary: false },
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
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540990260000).toISOString() },
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
          {
            arrival: { scheduledtime: new Date(1540990270000).toISOString() },
            stop: {
              code: 'E2506',
              gtfsId: 'HSL:123456',
              name: 'Turvesolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
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
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1540989970000).toISOString() },
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
        start: { scheduledTime: new Date(1540989960000).toISOString() },
        to: {
          name: 'Testitie',
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
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'RAIL',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
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
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        intermediatePlaces: [],
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'A',
                },
              ],
            },
          ],
          gtfsId: 'A',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlternativeLegs: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find(LegInfo).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a stop alert at the "from" stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {
            gtfsId: 'A',
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                entities: [
                  {
                    __typename: AlertEntityType.Stop,
                    gtfsId: 'A',
                  },
                ],
              },
            ],
          },
        },
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: 'A',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlternativeLegs: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find(LegInfo).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should apply alertSeverityLevel due to a stop alert at the "to" stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: 'A',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {
            gtfsId: 'B',
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                entities: [
                  {
                    __typename: AlertEntityType.Stop,
                    gtfsId: 'B',
                  },
                ],
              },
            ],
          },
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlternativeLegs: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find(LegInfo).props().alertSeverityLevel).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should not apply alertSeverityLevel due to a stop alert at an intermediate stop', () => {
    const props = {
      ...defaultProps,
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        intermediatePlaces: [
          {
            arrival: { scheduledtime: new Date(1553856410).toISOString() },
            stop: {
              gtfsId: 'foobar',
              name: 'Foo',
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  entities: [
                    {
                      __typename: AlertEntityType.Stop,
                      gtfsId: 'foobar',
                    },
                  ],
                },
              ],
            },
          },
        ],
        route: {
          gtfsId: 'A',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlternativeLegs: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find(LegInfo).props().alertSeverityLevel).to.equal(
      undefined,
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
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: '1234',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A1234',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showTicketInformation: true,
          availableTickets: { HSL: { 'HSL:A': { price: 5.5, zones: ['A'] } } },
          hideExternalOperator: () => false,
        },
        focusFunction: () => () => {},
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
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: '1234',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A1234',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showTicketInformation: true,
          availableTickets: { HSL: { 'foo:A': { price: 5.5, zones: ['A'] } } },
          hideExternalOperator: () => false,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find('.disclaimer-container')).to.have.lengthOf(1);
    expect(wrapper.find('.agency-link')).to.have.lengthOf(1);
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 1553754595;
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Test',
          stop: {
            gtfsId: 'A',
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: startTime + 10000,
                effectiveStartDate: startTime - 10000,
                entities: [
                  {
                    __typename: AlertEntityType.Stop,
                    gtfsId: 'A',
                  },
                ],
              },
            ],
          },
        },
        duration: 1000,
        intermediatePlaces: [],
        route: {
          gtfsId: 'A1234',
        },
        start: { scheduledTime: new Date(startTime * 1000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A1234:01',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config,
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find(ServiceAlertIcon).prop('severityLevel')).to.equal(
      AlertSeverityLevelType.Info,
    );
  });

  it('should show header of the most severe alert', () => {
    const startTime = 123456789;
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Test',
          stop: {},
        },
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: 'A1234',
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Unknown,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'unkown header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'A1234',
                },
              ],
            },
            {
              alertSeverityLevel: AlertSeverityLevelType.Severe,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'severe header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'A1234',
                },
              ],
            },
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'warning header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'A1234',
                },
              ],
            },
          ],
        },
        start: { scheduledTime: new Date(startTime * 1000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A1234:01',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlertHeader: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find('.description').text()).to.equal('severe header');
  });

  it('should show header of unknown severity alerts if there is not alert more severe', () => {
    const startTime = 123456789;
    const props = {
      ...defaultProps,
      leg: {
        from: {
          name: 'Test',
          stop: {},
        },
        duration: 10000,
        intermediatePlaces: [],
        route: {
          gtfsId: 'A1234',
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Unknown,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'unknown header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'A1234',
                },
              ],
            },
          ],
        },
        start: { scheduledTime: new Date(startTime * 1000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A1234:01',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'BUS',
    };

    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        ...mockContext,
        config: {
          ...config,
          showAlertHeader: true,
        },
        focusFunction: () => () => {},
      },
    });
    expect(wrapper.find('.description').text()).to.equal('unknown header');
  });
});
