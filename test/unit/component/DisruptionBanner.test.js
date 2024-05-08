import React from 'react';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

import { Component as DisruptionBanner } from '../../../app/component/DisruptionBanner';
import DisruptionBannerAlert from '../../../app/component/DisruptionBannerAlert';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';

describe('<DisruptionBanner />', () => {
  it('should render a service alert', () => {
    const props = {
      breakpoint: 'large',
      currentTime: 1500,
      language: 'fi',
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

    const wrapper = shallowWithIntl(<DisruptionBanner {...props} />, {
      context: {
        config: { CONFIG: 'default' },
      },
    });
    expect(wrapper.find(DisruptionBannerAlert)).to.lengthOf(1);
  });
});
