import React from 'react';

import Departure from '../../../app/component/Departure';
import {
  asDepartures,
  Component as DepartureListContainer,
} from '../../../app/component/DepartureListContainer';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<DepartureListContainer />', () => {
  it("should include the alerts' severity levels", () => {
    // const props = {
    //   currentTime: 1000,
    //   rowClasses: '',
    //   stoptimes: [
    //     {
    //       trip: {
    //         pattern: {
    //           code: 'foo',
    //           route: {
    //             alerts: [
    //               {
    //                 alertSeverityLevel: AlertSeverityLevelType.Warning,
    //                 trip: {
    //                   pattern: {
    //                     code: 'foo',
    //                   },
    //                 },
    //               },
    //               {
    //                 alertSeverityLevel: AlertSeverityLevelType.Severe,
    //                 trip: {
    //                   pattern: {
    //                     code: 'bar',
    //                   },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     },
    //   ],
    // };
    // const wrapper = shallowWithIntl(<DepartureListContainer {...props} />);
    // expect(wrapper.find(Departure)).to.have.lengthOf(1);
    // expect(wrapper.debug()).to.equal(undefined);
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
