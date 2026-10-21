import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import StopNearYou from '../../../../app/component/nearyou/StopNearYou';
import { createTestConfig } from '../../helpers/mock-context';

vi.mock('../../../../app/component/nearyou/NearYouHeader', () => ({
  default: () => <div className="near-you-header" />,
}));
vi.mock(
  '../../../../app/component/nearyou/StopNearYouDepartureRowContainer',
  () => ({ default: () => <div className="departure-rows" /> }),
);
// jsdom has no layout, so truncation would cut the text
vi.mock('react-truncate-markup', () => ({
  default: ({ children }) => children,
}));

const config = createTestConfig({
  colors: { primary: '#00AFFF', caution: '#dc0451' },
  constantOperationStops: {},
});

const makeAlert = (overrides = {}) => ({
  entities: [{ __typename: 'Stop' }],
  alertHeaderText: 'Stop disruption',
  alertDescriptionText: null,
  alertSeverityLevel: 'WARNING',
  effectiveStartDate: null,
  effectiveEndDate: null,
  ...overrides,
});

const makeStop = (alerts = []) => ({
  gtfsId: 'HSL:1234',
  name: 'Stop',
  vehicleMode: 'BUS',
  locationType: 'STOP',
  alerts,
  stoptimesWithoutPatterns: [],
});

const renderView = alerts =>
  renderWithProviders(
    <StopNearYou
      stop={makeStop(alerts)}
      currentTime={1000}
      relay={{ refetch: vi.fn() }}
      isParentTabActive
    />,
    { config },
  );

describe('<StopNearYou /> alert banner', () => {
  it('shows the banner when the stop has a stop alert', () => {
    const { container } = renderView([makeAlert()]);
    expect(container.querySelector('.alert-container')).not.toBeNull();
    expect(container.querySelector('.alert-text').textContent).toBe(
      'Stop disruption',
    );
  });

  it('hides the banner when the stop has no alerts', () => {
    const { container } = renderView([]);
    expect(container.querySelector('.alert-container')).toBeNull();
  });

  it('hides the banner when alerts have no Stop entity', () => {
    const { container } = renderView([
      makeAlert({ entities: [{ __typename: 'Route' }] }),
    ]);
    expect(container.querySelector('.alert-container')).toBeNull();
  });
});
