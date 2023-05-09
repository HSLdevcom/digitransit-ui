import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import AlertList from '../../../app/component/AlertList';
import { Component as DisruptionListContainer } from '../../../app/component/DisruptionListContainer';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';

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
                __typename: AlertEntityType.Route,
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
                __typename: AlertEntityType.Stop,
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
                __typename: AlertEntityType.Route,
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
                __typename: AlertEntityType.Stop,
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

  it('should split service alert for stop and route entities', () => {
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
                __typename: AlertEntityType.Route,
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
              {
                __typename: AlertEntityType.Stop,
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

  it('should split service alert for routes based on mode', () => {
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
                __typename: AlertEntityType.Route,
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
              },
              {
                __typename: AlertEntityType.Route,
                type: 300,
                mode: 'TRAM',
                shortName: '3',
                gtfsId: 'foo:test',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(
      wrapper.find(AlertList).at(0).prop('serviceAlerts'),
    ).to.have.lengthOf(2);
  });

  it('should split service alert for routes based on color', () => {
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
                __typename: AlertEntityType.Route,
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
                color: 'ffffff',
              },
              {
                __typename: AlertEntityType.Route,
                type: 300,
                mode: 'BUS',
                shortName: '75',
                gtfsId: 'foo:test',
                color: '000000',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(
      wrapper.find(AlertList).at(0).prop('serviceAlerts'),
    ).to.have.lengthOf(2);
  });

  it('should not split service alert for routes with same color and mode', () => {
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
                __typename: AlertEntityType.Route,
                type: 200,
                mode: 'BUS',
                shortName: '63',
                gtfsId: 'foo:bar',
                color: 'ffffff',
              },
              {
                __typename: AlertEntityType.Route,
                type: 300,
                mode: 'BUS',
                shortName: '75',
                gtfsId: 'foo:test',
                color: 'ffffff',
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(
      wrapper.find(AlertList).at(0).prop('serviceAlerts'),
    ).to.have.lengthOf(1);
  });

  it('should filter out alerts with unsupported types', () => {
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
                __typename: AlertEntityType.Unknown,
              },
              {
                __typename: AlertEntityType.StopOnRoute,
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<DisruptionListContainer {...props} />);
    expect(wrapper.find('.no-alerts-container')).to.have.lengthOf(1);
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
                __typename: AlertEntityType.Route,
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
                __typename: AlertEntityType.Stop,
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
                __typename: AlertEntityType.Route,
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
                __typename: AlertEntityType.Stop,
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
