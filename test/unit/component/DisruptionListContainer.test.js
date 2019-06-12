import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import AlertList from '../../../app/component/AlertList';
import { Component as DisruptionListContainer } from '../../../app/component/DisruptionListContainer';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<DisruptionListContainer />', () => {
  it('should indicate that there are no alerts', () => {
    const props = {
      currentTime: 0,
      root: {},
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.stop-no-alerts-container')).to.have.lengthOf(1);
  });

  it('should render warning level service alerts for stops and routes', () => {
    const props = {
      currentTime: 0,
      root: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            route: {
              mode: 'BUS',
              shortName: '63',
            },
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            stop: {
              code: '1234',
              vehicleMode: 'RAIL',
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find(AlertList)).to.have.lengthOf(2);
  });

  it('should render info level service alerts for stops and routes', () => {
    const props = {
      currentTime: 0,
      root: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            route: {
              mode: 'BUS',
              shortName: '63',
            },
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            stop: {
              code: '1234',
              vehicleMode: 'RAIL',
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find(AlertList)).to.have.lengthOf(2);
  });

  it('should not display the severity level selector', () => {
    const props = {
      currentTime: 0,
      root: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            route: {
              mode: 'BUS',
              shortName: '63',
            },
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            stop: {
              code: '1234',
              vehicleMode: 'RAIL',
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.stop-tab-container.collapsed')).to.have.lengthOf(1);
  });

  it('should display the severity level selector', () => {
    const props = {
      currentTime: 0,
      root: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            route: {
              mode: 'BUS',
              shortName: '63',
            },
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            stop: {
              code: '1234',
              vehicleMode: 'RAIL',
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.stop-tab-container.collapsed')).to.have.lengthOf(0);
    expect(wrapper.find('.stop-tab-container')).to.have.lengthOf(1);
  });
});
