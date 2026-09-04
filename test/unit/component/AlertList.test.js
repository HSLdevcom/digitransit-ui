import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as AlertList } from '../../../app/component/AlertList';
import { AlertEntityType } from '../../../app/constants';

describe('<AlertList />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      cancelations: [],
      serviceAlerts: [],
    };
    const { container } = renderWithProviders(<AlertList {...props} />, {
      currentTime: 1547464412,
    });
    expect(container.querySelector('.no-alerts-container')).to.not.equal(null);
  });

  it('should order the cancelations and service alerts by route shortName and put alerts first', () => {
    const props = {
      cancelations: [
        {
          alertHeaderText: 'third',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'BUS',
              shortName: '37N',
              gtfsId: 'foo:2037N',
            },
          ],
        },
        {
          alertHeaderText: 'fourth',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'RAIL',
              shortName: 'A',
              gtfsId: 'foo:2000A',
            },
          ],
        },
      ],
      serviceAlerts: [
        {
          alertHeaderText: 'second',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'BUS',
              shortName: '138',
              gtfsId: 'foo:138',
            },
          ],
        },
        {
          alertHeaderText: 'first',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const { container } = renderWithProviders(<AlertList {...props} />, {
      currentTime: 1547464414,
    });
    const routeIdentifiers = [
      ...container.querySelectorAll('.route-alert-entityid'),
    ].map(identifier => identifier.textContent);
    expect(routeIdentifiers).to.deep.equal(['8A', '138', '37N', 'A']);
  });

  it('should not display past service alerts', () => {
    const props = {
      cancelations: [],
      serviceAlerts: [
        {
          alertHeaderText: 'alert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1,
          effectiveEndDate: 99,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const { container } = renderWithProviders(<AlertList {...props} />, {
      currentTime: 100,
    });
    expect(container.querySelector('.no-alerts-container')).to.not.equal(null);
  });

  it('should display current cancelations and service alerts', () => {
    const props = {
      cancelations: [
        {
          alertHeaderText: 'cancelation',
          alertSeverityLevel: 'SEVERE',
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
      serviceAlerts: [
        {
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 100,
          effectiveEndDate: 100,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const { container } = renderWithProviders(<AlertList {...props} />, {
      currentTime: 100,
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(2);
  });

  it('should not display future service alerts', () => {
    const props = {
      serviceAlerts: [
        {
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 101,
          effectiveEndDate: 200,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const { container } = renderWithProviders(<AlertList {...props} />, {
      currentTime: 100,
    });
    expect(container.querySelector('.no-alerts-container')).to.not.equal(null);
  });
});
