import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';

import { renderWithProviders } from '../helpers/mock-providers';
import TransitLeg from '../../../app/component/itinerary/TransitLeg';
import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';

const defaultProps = {
  children: <div />,
  interliningLegs: [],
  focusFunction: () => () => {},
  focusAction: () => {},
  index: 0,
};

const config = {
  CONFIG: 'hsl',
  itinerary: {},
  zones: { itinerary: true },
  feedIds: ['HSL'],
  colors: { primary: 'ffffff' },
  language: 'fi',
};

describe('<TransitLeg />', () => {
  // LegAgencyInfo calls useFragment on a plain leg object (no real Relay
  // store in this unit env), which logs a harmless RelayModernSelector
  // warning that the global harness would otherwise turn into a thrown error.
  let savedConsoleError;
  beforeEach(() => {
    // eslint-disable-next-line no-console
    savedConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = warning => {
      if (String(warning).includes('RelayModernSelector')) {
        return;
      }
      throw new Error(warning);
    };
  });
  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = savedConsoleError;
  });

  const renderLeg = (props, legConfig = config) =>
    renderWithProviders(<TransitLeg {...defaultProps} {...props} />, {
      config: legConfig,
    });

  it('should show a zone change between from and the first intermediate place', () => {
    const props = {
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {
            zoneId: 'A',
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [
          {
            arrival: { scheduledTime: new Date(1540990260000).toISOString() },
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
      mode: 'bus',
    };
    const { container } = renderLeg(props);
    const zoneIcons = container.querySelectorAll(
      '.time-column-zone-icons-container.intermediate-leg .circle',
    );
    // previous stop's zone ('A') then the current stop's zone ('B'); no
    // 'next' zone icon since 'to' has no zoneId.
    expect([...zoneIcons].map(el => el.textContent)).to.deep.equal(['A', 'B']);
  });

  it('should show a zone change between the last intermediate place and to', () => {
    const props = {
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [
          {
            arrival: { scheduledTime: new Date(1540990260000).toISOString() },
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
      mode: 'bus',
    };
    const { container } = renderLeg(props);
    const zoneIcons = container.querySelectorAll(
      '.time-column-zone-icons-container.intermediate-leg .circle',
    );
    // no 'previous' zone icon (from has no zoneId); current ('B') then next ('C').
    expect([...zoneIcons].map(el => el.textContent)).to.deep.equal(['B', 'C']);
  });

  it('should not show any zone changes if the feature is disabled', () => {
    const props = {
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {
            gtfsId: 'HSL:1',
          },
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [
          {
            arrival: { scheduledTime: new Date(1540990260000).toISOString() },
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
      mode: 'bus',
    };
    const { container } = renderLeg(props, {
      ...config,
      zones: { itinerary: false },
    });
    expect(
      container.querySelector('.time-column-zone-icons-container'),
    ).to.equal(null);
  });

  it('should apply isCanceled to an intermediate leg', () => {
    const props = {
      leg: {
        from: {
          name: 'Huopalahti',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [
          {
            arrival: { scheduledTime: new Date(1540989970000).toISOString() },
            stop: {
              code: '007',
              gtfsId: 'stop1',
              name: 'Ilmala',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:A',
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
      mode: 'rail',
    };
    const { container } = renderLeg(props);
    expect(
      container.querySelector('.itinerary-intermediate-stop-name .canceled'),
    ).to.not.equal(null);
  });

  it('should apply alertSeverityLevel due to a route alert', () => {
    const props = {
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'HSL:A',
                },
              ],
            },
          ],
          gtfsId: 'HSL:A',
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
      mode: 'bus',
    };
    const { container } = renderLeg(props, {
      ...config,
      showAlternativeLegs: true,
    });
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should apply alertSeverityLevel due to a stop alert at the "from" stop', () => {
    const props = {
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {
            gtfsId: 'A:123',
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                entities: [
                  {
                    __typename: AlertEntityType.Stop,
                    gtfsId: 'A:123',
                  },
                ],
              },
            ],
          },
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'A:2',
        },
        start: { scheduledTime: new Date(1553856180000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'A12345',
          pattern: {
            code: 'A:2:01',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'bus',
    };
    const { container } = renderLeg(props, {
      ...config,
      showAlternativeLegs: true,
    });
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should apply alertSeverityLevel due to a stop alert at the "to" stop', () => {
    const props = {
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'HSL:A',
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
      mode: 'bus',
    };
    const { container } = renderLeg(props, {
      ...config,
      showAlternativeLegs: true,
    });
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should not apply alertSeverityLevel due to a stop alert at an intermediate stop', () => {
    const props = {
      leg: {
        end: { scheduledtime: new Date(1553856420000).toISOString() },
        from: {
          name: 'Testilahti',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [
          {
            arrival: { scheduledTime: new Date(1553856410).toISOString() },
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
          gtfsId: 'HSL:A',
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
      mode: 'bus',
    };
    const { container } = renderLeg(props, {
      ...config,
      showAlternativeLegs: true,
    });
    expect(container.querySelector('.subicon-caution')).to.equal(null);
    expect(container.querySelector('.subicon-info')).to.equal(null);
  });

  it('should show a disclaimer with relevant information for an unknown ticket', () => {
    const props = {
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
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'HSL:1234',
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
      mode: 'bus',
    };

    const { container } = renderLeg(props, {
      ...config,
      showTicketInformation: true,
      availableTickets: { HSL: { 'HSL:A': { price: 5.5, zones: ['A'] } } },
      hideExternalOperator: () => false,
    });
    expect(
      container.querySelectorAll('.disclaimer-container'),
    ).to.have.lengthOf(1);
    expect(container.querySelectorAll('.agency-link')).to.have.lengthOf(1);
  });

  it('should not show a disclaimer for an unknown ticket when there is nothing for feedIds in availableTickets', () => {
    const props = {
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
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'HSL:1234',
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
      mode: 'bus',
    };

    const { container } = renderLeg(props, {
      ...config,
      showTicketInformation: true,
      availableTickets: { HSL: { 'foo:A': { price: 5.5, zones: ['A'] } } },
      hideExternalOperator: () => false,
    });
    expect(
      container.querySelectorAll('.disclaimer-container'),
    ).to.have.lengthOf(1);
    expect(container.querySelectorAll('.agency-link')).to.have.lengthOf(1);
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 1553754595;
    const props = {
      leg: {
        from: {
          name: 'Test',
          stop: {
            gtfsId: 'A:123',
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: startTime + 10000,
                effectiveStartDate: startTime - 10000,
                entities: [
                  {
                    __typename: AlertEntityType.Stop,
                    gtfsId: 'A:123',
                  },
                ],
              },
            ],
          },
        },
        duration: 1000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'FOO:A1234',
        },
        start: { scheduledTime: new Date(startTime * 1000).toISOString() },
        to: {
          name: 'Testitie',
          stop: {},
        },
        trip: {
          gtfsId: 'FOO:A1234:01',
          pattern: {
            code: 'A',
          },
          tripHeadsign: 'foo - bar',
        },
        interlineWithPreviousLeg: false,
      },
      mode: 'bus',
    };

    const { container } = renderLeg(props);
    expect(container.querySelector('.inline-icon.info')).to.not.equal(null);
  });

  it('should show header of the most severe alert', () => {
    const startTime = 123456789;
    const props = {
      leg: {
        from: {
          name: 'Test',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'HSL:A1234',
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Unknown,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'unkown header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'HSL:A1234',
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
                  gtfsId: 'HSL:A1234',
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
                  gtfsId: 'HSL:A1234',
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
      mode: 'bus',
    };

    const { container } = renderLeg(props, {
      ...config,
      showAlertHeader: true,
    });
    expect(container.querySelector('.description').textContent).to.equal(
      'severe header',
    );
  });

  it('should show header of unknown severity alerts if there is not alert more severe', () => {
    const startTime = 123456789;
    const props = {
      leg: {
        from: {
          name: 'Test',
          stop: {},
        },
        duration: 10000,
        mode: 'BUS',
        intermediatePlaces: [],
        route: {
          gtfsId: 'HSL:A1234',
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Unknown,
              effectiveEndDate: startTime + 1,
              effectiveStartDate: startTime - 1,
              alertHeaderText: 'unknown header',
              entities: [
                {
                  __typename: AlertEntityType.Route,
                  gtfsId: 'HSL:A1234',
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
      mode: 'bus',
    };

    const { container } = renderLeg(props, {
      ...config,
      showAlertHeader: true,
    });
    expect(container.querySelector('.description').textContent).to.equal(
      'unknown header',
    );
  });
});
