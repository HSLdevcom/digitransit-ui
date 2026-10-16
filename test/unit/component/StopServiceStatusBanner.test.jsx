import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import translations from '../../../app/translations/en';
import StopServiceStatusBanner from '../../../app/component/stop/StopServiceStatusBanner';
import {
  STOP_STATUS,
  STOP_STATUS_MESSAGE_IDS,
} from '../../../utils/client/stopStatusUtils';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';

const messages = translations.en;

const markersOff = createTestConfig({ showStopStatusMarkers: false });
const markersOn = createTestConfig({ showStopStatusMarkers: true });

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

const render = (props, config = markersOff) =>
  renderWithProviders(<StopServiceStatusBanner {...baseProps} {...props} />, {
    config,
  });

const getBadgeImg = container =>
  container
    .querySelector('.stop-no-departures-badge use')
    ?.getAttribute('xlink:href');

const statusText = status => messages[STOP_STATUS_MESSAGE_IDS[status]];

describe('<StopServiceStatusBanner />', () => {
  describe('no-departures mode (empty stoptimes)', () => {
    it('renders the no-departures container', () => {
      const { container } = render({});
      expect(
        container.querySelector('.stop-no-departures-container'),
      ).not.toBeNull();
    });

    it('shows no badge and the "no departures" text when showStopStatusMarkers is false', () => {
      const { container } = render({
        alerts: [makeAlert(AlertSeverityLevelType.Warning)],
      });
      expect(getBadgeImg(container)).toBeUndefined();
      expect(container.textContent).toBe(messages['no-departures']);
    });

    it('shows clock badge and NO_SERVICE_TODAY when no alerts and future service exists', () => {
      const { container } = render(
        { alerts: [], servicesRunningInFuture: true },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe(
        '#icon_stop-temporarily-closed-badge',
      );
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.NO_SERVICE_TODAY),
      );
    });

    it('shows closed badge and OUT_OF_SERVICE when no future service', () => {
      const { container } = render(
        { alerts: [], servicesRunningInFuture: false },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe('#icon_stop-closed-badge');
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.OUT_OF_SERVICE),
      );
    });

    it('shows closed badge and OUT_OF_SERVICE for a NO_SERVICE alert', () => {
      const { container } = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'NO_SERVICE')],
          servicesRunningInFuture: true,
        },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe('#icon_stop-closed-badge');
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.OUT_OF_SERVICE),
      );
    });

    it('shows caution badge and the alert effect when a warning alert is active and future service exists', () => {
      const { container } = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
          servicesRunningInFuture: true,
        },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe('#icon_caution-badge');
      expect(container.textContent).toBe(messages['disruption-badge-detour']);
    });

    it('shows clock badge and NO_SERVICE_TODAY when only an INFO alert is active and future service exists', () => {
      const { container } = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Info)],
          servicesRunningInFuture: true,
        },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe(
        '#icon_stop-temporarily-closed-badge',
      );
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.NO_SERVICE_TODAY),
      );
    });
  });

  describe('with-departures mode (non-empty stoptimes)', () => {
    const futureStoptime = { serviceDay: 2000 }; // > currentTime (1000)
    const todayStoptime = { serviceDay: 0 }; // < currentTime (1000)

    it('renders nothing when showStopStatusMarkers is false', () => {
      const { container } = render({ stoptimes: [futureStoptime] });
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when any stoptime is from today (serviceDay < currentTime)', () => {
      const { container } = render({ stoptimes: [todayStoptime] }, markersOn);
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when today and future stoptimes are mixed', () => {
      const { container } = render(
        { stoptimes: [todayStoptime, futureStoptime], alerts: [] },
        markersOn,
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders the status banner for future-day stoptimes with markers enabled', () => {
      const { container } = render(
        { stoptimes: [futureStoptime], alerts: [] },
        markersOn,
      );
      expect(
        container.querySelector('.stop-service-status-banner'),
      ).not.toBeNull();
    });

    it('shows NO_SERVICE_TODAY badge when there are no active alerts', () => {
      const { container } = render(
        { stoptimes: [futureStoptime], alerts: [] },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe(
        '#icon_stop-temporarily-closed-badge',
      );
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.NO_SERVICE_TODAY),
      );
    });

    it('shows NO_SERVICE_TODAY rather than OUT_OF_SERVICE regardless of the servicesRunningInFuture prop', () => {
      // banner mode hardcodes servicesRunningInFuture=true because stoptimes are present
      const { container } = render(
        {
          stoptimes: [futureStoptime],
          alerts: [],
          servicesRunningInFuture: false,
        },
        markersOn,
      );
      expect(container.textContent).toBe(
        statusText(STOP_STATUS.NO_SERVICE_TODAY),
      );
    });

    it('shows caution badge and the alert effect when a warning alert is active with future stoptimes', () => {
      const { container } = render(
        {
          stoptimes: [futureStoptime],
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
        },
        markersOn,
      );
      expect(getBadgeImg(container)).toBe('#icon_caution-badge');
      expect(container.textContent).toBe(messages['disruption-badge-detour']);
    });
  });
});
