import React from 'react';

import Departure from '../../../app/component/Departure';
import {
  asDepartures,
  Component as DepartureListContainer,
} from '../../../app/component/DepartureListContainer';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import { mockContext } from '../helpers/mock-context';

describe('<DepartureListContainer />', () => {
  it("should include the alerts' severity levels", () => {
    const props = {
      currentTime: 1000,
      rowClasses: '',
      stoptimes: [
        {
          realtimeArrival: 1050,
          realtimeDeparture: 1100,
          scheduledArrival: 1050,
          scheduledDeparture: 1100,
          serviceDay: 0,
          trip: {
            pattern: {
              code: 'foo',
              route: {
                alerts: [
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Warning,
                    trip: {
                      pattern: {
                        code: 'foo',
                      },
                    },
                  },
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Severe,
                    trip: {
                      pattern: {
                        code: 'foo',
                      },
                    },
                  },
                ],
                mode: 'BUS',
              },
            },
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<DepartureListContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(Departure).prop('alertSeverityLevel')).to.equal(
      AlertSeverityLevelType.Severe,
    );
  });

  describe('asDepartures', () => {
    it("should map the alerts' severity levels", () => {
      const stoptimes = [
        {
          trip: {
            pattern: {
              code: 'foo',
              route: {
                alerts: [
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Warning,
                    trip: {
                      pattern: {
                        code: 'foo',
                      },
                    },
                  },
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Severe,
                    trip: {
                      pattern: {
                        code: 'bar',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ];
      const departures = asDepartures(stoptimes);
      expect(departures[0].alerts).to.have.lengthOf(1);
      expect(departures[0].alerts[0].alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Warning,
      );
    });
  });
});
