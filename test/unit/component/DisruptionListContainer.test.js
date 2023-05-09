import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import AlertList from '../../../app/component/AlertList';
import { Component as DisruptionListContainer } from '../../../app/component/DisruptionListContainer';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<DisruptionListContainer />', () => {
  it('should indicate that there are no alerts', () => {
    const props = {
      currentTime: 0,
      viewer: {},
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.no-alerts-container')).to.have.lengthOf(1);
  });

  it('should render warning level service alerts for stops and routes', () => {
    const props = {
      currentTime: 0,
      viewer: {
        alerts: [
          {
            alertHeaderText: 'servicealert',
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Route',
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
            ],
          },
          {
            alertHeaderText: 'servicealert2',
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Stop',
                gtfsId: 'foo:bar',
                name: 'foo',
                code: '123',
                vehicleMode: 'BUS',
              },
            ],
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
      viewer: {
        alerts: [
          {
            alertHeaderText: 'servicealert',
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Route',
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
            ],
          },
          {
            alertHeaderText: 'servicealert2',
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Stop',
                gtfsId: 'foo:bar',
                name: 'foo',
                code: '123',
                vehicleMode: 'BUS',
              },
            ],
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
      viewer: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Route',
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
            ],
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Stop',
                gtfsId: 'foo:bar',
                name: 'foo',
                code: '1234',
                vehicleMode: 'RAIL',
              },
            ],
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
      viewer: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Route',
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
            ],
          },
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveEndDate: 100,
            effectiveStartDate: 0,
            entities: [
              {
                __typename: 'Stop',
                gtfsId: 'foo:bar',
                name: 'foo',
                code: '1234',
                vehicleMode: 'RAIL',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.stop-tab-container.collapsed')).to.have.lengthOf(0);
    expect(wrapper.find('.stop-tab-container')).to.have.lengthOf(1);
  });
});
