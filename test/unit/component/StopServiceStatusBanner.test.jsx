import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import StopServiceStatusBanner from '../../../app/component/stop/StopServiceStatusBanner';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9', bus: '#007ac9', tram: '#00985f' },
  showStopStatusMarkers: false,
  useExtendedRouteTypes: false,
};

const baseProps = {
  mode: 'BUS',
  modeColor: '#007ac9',
  stoptimes: [],
  currentTime: 1000,
};

const makeAlert = (alertSeverityLevel, alertEffect = null) => ({
  alertSeverityLevel,
  alertEffect,
  effectiveStartDate: 0,
  effectiveEndDate: 9999999999,
});

const render = (props, config = baseConfig) =>
  renderWithProviders(<StopServiceStatusBanner {...baseProps} {...props} />, {
    config,
  });

describe('<StopServiceStatusBanner />', () => {
  it('renders a no-departures message when status markers are disabled', () => {
    const { container } = render({});

    expect(
      container.querySelector('.stop-no-departures-container'),
    ).not.toBeNull();
    expect(container.textContent).toContain('No departures');
  });

  it('shows an out-of-service status when future service is unavailable', () => {
    const { container } = render(
      { alerts: [], servicesRunningInFuture: false },
      { ...baseConfig, showStopStatusMarkers: true },
    );

    expect(
      container.querySelector('.stop-schedule-status.out-of-service'),
    ).not.toBeNull();
  });

  it('shows alert effects when a warning is active and future service exists', () => {
    const { container } = render(
      {
        alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
        servicesRunningInFuture: true,
      },
      { ...baseConfig, showStopStatusMarkers: true },
    );

    expect(
      container.querySelector('.stop-schedule-status__effect.alert'),
    ).not.toBeNull();
  });

  it('does not render a banner for departures on the current service day', () => {
    const { container } = render(
      { stoptimes: [{ serviceDay: 0 }] },
      { ...baseConfig, showStopStatusMarkers: true },
    );

    expect(container.firstChild).toBeNull();
  });
});
