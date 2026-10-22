import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import StopServiceStatusBanner from '../../../app/component/stop/StopServiceStatusBanner';
import { AlertSeverityLevelType } from '../../../utils/client/constants';

const baseConfig = createTestConfig({ showStopStatusMarkers: false });
const markersConfig = createTestConfig({ showStopStatusMarkers: true });

const baseProps = {
  mode: 'bus',
  modeColor: '#007ac9',
  stoptimes: [],
  currentTime: 1000,
};

// An alert with effectiveStartDate:0 is always treated as valid by isAlertValid
const makeAlert = (alertSeverityLevel, alertEffect = null) => ({
  alertSeverityLevel,
  alertEffect,
  effectiveStartDate: 0,
  effectiveEndDate: 9999999999,
});

const renderBanner = (props, config = baseConfig) =>
  renderWithProviders(<StopServiceStatusBanner {...baseProps} {...props} />, {
    config,
  });

const badgeImg = container =>
  container
    .querySelector('.stop-no-departures-badge use')
    ?.getAttribute('xlink:href');

describe('<StopServiceStatusBanner />', () => {
  describe('no-departures mode (empty stoptimes)', () => {
    it('renders the no-departures container', () => {
      const { container } = renderBanner({});
      expect(
        container.querySelector('.stop-no-departures-container'),
      ).not.toBeNull();
    });

    it('shows no badge and "no departures" text when showStopStatusMarkers is false', () => {
      const { container } = renderBanner({
        alerts: [makeAlert(AlertSeverityLevelType.Warning)],
      });
      expect(container.querySelector('.stop-no-departures-badge')).toBeNull();
      expect(container.textContent).toBe('No departures');
    });

    it('shows clock badge and NO_SERVICE_TODAY when no alerts and future service exists', () => {
      const { container } = renderBanner(
        { alerts: [], servicesRunningInFuture: true },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_stop-temporarily-closed-badge');
      expect(container.textContent).toBe('No departures today');
    });

    it('shows closed badge and OUT_OF_SERVICE when no future service', () => {
      const { container } = renderBanner(
        { alerts: [], servicesRunningInFuture: false },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_stop-closed-badge');
      expect(container.textContent).toBe('Stop out of service');
    });

    it('shows closed badge and OUT_OF_SERVICE for a NO_SERVICE alert', () => {
      const { container } = renderBanner(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'NO_SERVICE')],
          servicesRunningInFuture: true,
        },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_stop-closed-badge');
      expect(container.textContent).toBe('Stop out of service');
    });

    it('shows caution badge and ALERT effect when a warning alert is active and future service exists', () => {
      const { container } = renderBanner(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
          servicesRunningInFuture: true,
        },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_caution-badge');
      expect(
        container.querySelector('.stop-schedule-status__effect.alert')
          .textContent,
      ).toBe('Diversion');
    });

    it('shows clock badge and NO_SERVICE_TODAY when only an INFO alert is active and future service exists', () => {
      const { container } = renderBanner(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Info)],
          servicesRunningInFuture: true,
        },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_stop-temporarily-closed-badge');
      expect(container.textContent).toBe('No departures today');
    });
  });

  describe('with-departures mode (non-empty stoptimes)', () => {
    const futureStoptime = { serviceDay: 2000 }; // > currentTime (1000)
    const todayStoptime = { serviceDay: 0 }; // < currentTime (1000)

    it('renders nothing when showStopStatusMarkers is false', () => {
      const { container } = renderBanner({ stoptimes: [futureStoptime] });
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing when any stoptime is from today (serviceDay < currentTime)', () => {
      const { container } = renderBanner(
        { stoptimes: [todayStoptime] },
        markersConfig,
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing when stoptimes include any today-stoptime alongside future stoptimes', () => {
      const { container } = renderBanner(
        { stoptimes: [todayStoptime, futureStoptime], alerts: [] },
        markersConfig,
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders the status banner for future-day stoptimes with markers enabled', () => {
      const { container } = renderBanner(
        { stoptimes: [futureStoptime], alerts: [] },
        markersConfig,
      );
      expect(
        container.querySelector('.stop-service-status-banner'),
      ).not.toBeNull();
    });

    it('shows NO_SERVICE_TODAY badge when there are no active alerts', () => {
      const { container } = renderBanner(
        { stoptimes: [futureStoptime], alerts: [] },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_stop-temporarily-closed-badge');
      expect(container.textContent).toBe('No departures today');
    });

    it('shows NO_SERVICE_TODAY rather than OUT_OF_SERVICE regardless of the servicesRunningInFuture prop', () => {
      // banner mode hardcodes servicesRunningInFuture=true because stoptimes are present
      const { container } = renderBanner(
        {
          stoptimes: [futureStoptime],
          alerts: [],
          servicesRunningInFuture: false,
        },
        markersConfig,
      );
      expect(container.textContent).toBe('No departures today');
    });

    it('shows caution badge and ALERT effect when a warning alert is active with future stoptimes', () => {
      const { container } = renderBanner(
        {
          stoptimes: [futureStoptime],
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
        },
        markersConfig,
      );
      expect(badgeImg(container)).toBe('#icon_caution-badge');
      expect(
        container.querySelector('.stop-schedule-status__effect.alert')
          .textContent,
      ).toBe('Diversion');
    });
  });
});
