import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as DisruptionBanner } from '../../../app/component/DisruptionBanner';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';

describe('<DisruptionBanner />', () => {
  it('should render a service alert', () => {
    const props = {
      breakpoint: 'large',
      mode: 'BUS',
      alerts: [
        {
          alertDescriptionText: 'mock-description',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          effectiveStartDate: 1000,
          effectiveEndDate: 2000,
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'BUS',
              shortName: '1',
              gtfsId: 'foo:1',
            },
          ],
        },
      ],
    };

    const { container } = renderWithProviders(<DisruptionBanner {...props} />, {
      config: { CONFIG: 'default', URL: {}, language: 'fi' },
      currentTime: 1500,
    });
    expect(
      container.querySelectorAll('.disruption-container'),
    ).to.have.lengthOf(1);
  });
});
