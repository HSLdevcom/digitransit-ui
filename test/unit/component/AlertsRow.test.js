import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import AlertRow, { getAlertRoutePath } from '../../../app/component/AlertRow';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';

describe('<AlertRow />', () => {
  const routeEntity = {
    __typename: AlertEntityType.Route,
    mode: 'BUS',
    shortName: '1',
    gtfsId: 'HSL:2097N',
  };

  const baseProps = {
    expired: false,
    description: 'Lorem ipsum',
    index: 0,
    feed: 'foo',
    entities: [routeEntity],
  };

  it('should not render when description and header are missing', () => {
    const { container } = renderWithProviders(
      <AlertRow {...baseProps} description={undefined} header={undefined} />,
    );
    expect(container.querySelector('.alert-row')).to.equal(null);
  });

  it('should render when only a header is provided', () => {
    const { container } = renderWithProviders(
      <AlertRow
        {...baseProps}
        description={undefined}
        header="Service alert"
      />,
    );
    expect(container.querySelector('.alert-row')).to.not.equal(null);
  });

  it('should render the description in the alert body', () => {
    const { container } = renderWithProviders(<AlertRow {...baseProps} />);
    expect(container.querySelector('.alert-body').textContent).to.include(
      'Lorem ipsum',
    );
  });

  it('should render the route identifier', () => {
    const { container } = renderWithProviders(<AlertRow {...baseProps} />);
    expect(
      container.querySelector('.route-alert-entityid').textContent,
    ).to.equal('1');
  });

  it('should create the route page path for a route alert', () => {
    expect(getAlertRoutePath('HSL:2097N')).to.equal(
      '/linjat/HSL%3A2097N/pysakit',
    );
  });

  it('should render an info icon for an informational stop alert', () => {
    const { container } = renderWithProviders(
      <AlertRow
        {...baseProps}
        entities={[{ __typename: AlertEntityType.Stop, gtfsId: 'HSL:1' }]}
        severityLevel={AlertSeverityLevelType.Info}
      />,
    );
    expect(container.querySelector('.stop-disruption.info')).to.not.equal(null);
  });

  it('should show the time period', () => {
    const { container } = renderWithProviders(
      <AlertRow
        {...baseProps}
        currentTime={15}
        startTime={20}
        endTime={30}
        severityLevel={AlertSeverityLevelType.Warning}
      />,
    );
    expect(container.querySelector('.alert-top-row').textContent).to.include(
      'at',
    );
  });

  it('should render the extra-information URL', () => {
    const { container } = renderWithProviders(
      <AlertRow {...baseProps} url="https://www.hsl.fi" />,
    );
    expect(container.querySelector('.alert-url')).to.not.equal(null);
  });

  it('should render a warning stop icon for a warning alert', () => {
    const { container } = renderWithProviders(
      <AlertRow
        {...baseProps}
        entities={[{ __typename: AlertEntityType.Stop, gtfsId: 'HSL:1' }]}
        severityLevel={AlertSeverityLevelType.Warning}
      />,
    );
    expect(container.querySelector('.stop-disruption.warning')).to.not.equal(
      null,
    );
  });

  it("should add the http prefix to a URL if it's missing", () => {
    const { container } = renderWithProviders(
      <AlertRow {...baseProps} url="www.hsl.fi" />,
    );
    expect(
      container.querySelector('.alert-url .external-link').getAttribute('href'),
    ).to.equal('http://www.hsl.fi');
  });
});
