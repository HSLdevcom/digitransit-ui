import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { renderWithProviders } from '../helpers/mock-providers';
import DisruptionList from '../../../app/component/DisruptionList';
import { AlertEntityType } from '../../../utils/shared/constants';

const renderList = (props, currentTime = 1547464412) =>
  renderWithProviders(<DisruptionList {...props} />, { currentTime }).container;

const alertRowTitles = container =>
  Array.from(container.querySelectorAll('.alert-row-title')).map(
    node => node.textContent,
  );

describe('<DisruptionList />', () => {
  it('should show a "no alerts" message', () => {
    const container = renderList({ cancelations: [], serviceAlerts: [] });
    expect(container.textContent).to.contain('Services normal');
  });

  it('should list cancelations before service alerts', () => {
    const props = {
      cancelations: [
        {
          id: 'cancel-3',
          alertHeaderText: 'third',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'cancel-4',
          alertHeaderText: 'fourth',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'alert-2',
          alertHash: 2,
          alertHeaderText: 'second',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'alert-1',
          alertHash: 1,
          alertHeaderText: 'first',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
    const container = renderList(props, 1547464414);
    expect(alertRowTitles(container)).to.deep.equal([
      'third',
      'fourth',
      'second',
      'first',
    ]);
  });

  it('should not display past service alerts', () => {
    const props = {
      cancelations: [],
      serviceAlerts: [
        {
          id: 'alert',
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
    const container = renderList(props, 100);
    expect(container.textContent).to.contain('Services normal');
  });

  it('should display current cancelations and service alerts', () => {
    const props = {
      cancelations: [
        {
          id: 'cancelation',
          alertHeaderText: 'cancelation',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 50,
          effectiveEndDate: 150,
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
          id: 'servicealert',
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 50,
          effectiveEndDate: 150,
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
    const container = renderList(props, 100);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(2);
  });

  it('should display future service alerts under the upcoming section', () => {
    const props = {
      serviceAlerts: [
        {
          id: 'servicealert',
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
    const container = renderList(props, 100);
    // Active section is empty (rendered as a <p>), Upcoming section has 1 item
    expect(
      container.querySelector('p.alerts-list-section-no-alerts'),
    ).to.not.equal(null);
    expect(container.querySelectorAll('[role="list"]')).to.have.lengthOf(1);
    expect(
      container.querySelectorAll('[role="list"] .alert-row'),
    ).to.have.lengthOf(1);
  });
});
