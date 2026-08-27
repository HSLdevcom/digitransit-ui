import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import StopServiceStatusBanner from '../../../app/component/stop/StopServiceStatusBanner';
import Icon from '../../../app/component/Icon';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import { STOP_STATUS } from '../../../app/util/stopStatusUtils';
import { AlertSeverityLevelType } from '../../../app/constants';

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

// An alert with effectiveStartDate:0 is always treated as valid by isAlertValid
const makeAlert = (alertSeverityLevel, alertEffect = null) => ({
  alertSeverityLevel,
  alertEffect,
  effectiveStartDate: 0,
  effectiveEndDate: 9999999999,
});

const render = (props, config = baseConfig) =>
  shallowWithIntl(<StopServiceStatusBanner {...baseProps} {...props} />, {
    config,
  });

describe('<StopServiceStatusBanner />', () => {
  describe('no-departures mode (empty stoptimes)', () => {
    it('renders the no-departures container', () => {
      const wrapper = render({});
      expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(1);
    });

    it('shows no badge and "no-departures" text when showStopStatusMarkers is false', () => {
      const wrapper = render({
        alerts: [makeAlert(AlertSeverityLevelType.Warning)],
      });
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge'),
      ).to.have.lengthOf(0);
      expect(wrapper.find('FormattedMessage').prop('id')).to.equal(
        'no-departures',
      );
    });

    it('shows clock badge and NO_SERVICE_TODAY when no alerts and future service exists', () => {
      const wrapper = render(
        { alerts: [], servicesRunningInFuture: true },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_stop-temporarily-closed-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.NO_SERVICE_TODAY,
      );
    });

    it('shows closed badge and OUT_OF_SERVICE when no future service', () => {
      const wrapper = render(
        { alerts: [], servicesRunningInFuture: false },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_stop-closed-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.OUT_OF_SERVICE,
      );
    });

    it('shows closed badge and OUT_OF_SERVICE for a NO_SERVICE alert', () => {
      const wrapper = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'NO_SERVICE')],
          servicesRunningInFuture: true,
        },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_stop-closed-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.OUT_OF_SERVICE,
      );
    });

    it('shows caution badge and ALERT when a warning alert is active and future service exists', () => {
      const wrapper = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
          servicesRunningInFuture: true,
        },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_caution-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.ALERT,
      );
    });

    it('shows clock badge and NO_SERVICE_TODAY when only an INFO alert is active and future service exists', () => {
      const wrapper = render(
        {
          alerts: [makeAlert(AlertSeverityLevelType.Info)],
          servicesRunningInFuture: true,
        },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_stop-temporarily-closed-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.NO_SERVICE_TODAY,
      );
    });
  });

  describe('with-departures mode (non-empty stoptimes)', () => {
    const futureStoptime = { serviceDay: 2000 }; // > currentTime (1000)
    const todayStoptime = { serviceDay: 0 }; // < currentTime (1000)

    it('returns null when showStopStatusMarkers is false', () => {
      const wrapper = render({ stoptimes: [futureStoptime] });
      expect(wrapper.type()).to.equal(null);
    });

    it('returns null when any stoptime is from today (serviceDay < currentTime)', () => {
      const wrapper = render(
        { stoptimes: [todayStoptime] },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(wrapper.type()).to.equal(null);
    });

    it('returns null when stoptimes include any today-stoptime alongside future stoptimes', () => {
      // some() short-circuits: one today stoptime suppresses the banner even when others are future
      const wrapper = render(
        { stoptimes: [todayStoptime, futureStoptime], alerts: [] },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(wrapper.type()).to.equal(null);
    });

    it('renders the status banner for future-day stoptimes with markers enabled', () => {
      const wrapper = render(
        { stoptimes: [futureStoptime], alerts: [] },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(wrapper.find('.stop-service-status-banner')).to.have.lengthOf(1);
    });

    it('shows NO_SERVICE_TODAY badge when there are no active alerts', () => {
      const wrapper = render(
        { stoptimes: [futureStoptime], alerts: [] },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_stop-temporarily-closed-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.NO_SERVICE_TODAY,
      );
    });

    it('shows NO_SERVICE_TODAY rather than OUT_OF_SERVICE regardless of the servicesRunningInFuture prop', () => {
      // banner mode hardcodes servicesRunningInFuture=true because stoptimes are present
      const wrapper = render(
        {
          stoptimes: [futureStoptime],
          alerts: [],
          servicesRunningInFuture: false,
        },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.NO_SERVICE_TODAY,
      );
    });

    it('shows caution badge and ALERT when a warning alert is active with future stoptimes', () => {
      const wrapper = render(
        {
          stoptimes: [futureStoptime],
          alerts: [makeAlert(AlertSeverityLevelType.Warning, 'DETOUR')],
        },
        { ...baseConfig, showStopStatusMarkers: true },
      );
      expect(
        wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
      ).to.equal('icon_caution-badge');
      expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
        STOP_STATUS.ALERT,
      );
    });
  });
});
