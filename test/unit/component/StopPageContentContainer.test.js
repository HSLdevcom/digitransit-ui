import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockMatch } from '../helpers/mock-router';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as StopPageContentContainer } from '../../../app/component/stop/StopPageContentContainer';
import { AlertSeverityLevelType } from '../../../app/constants';
import Icon from '../../../app/component/Icon';
import DepartureListContainer from '../../../app/component/DepartureListContainer';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import { STOP_STATUS } from '../../../app/util/stopStatusUtils';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9', bus: '#007ac9', tram: '#00985f' },
  showStopStatusMarkers: false,
  useExtendedRouteTypes: false,
  externalFerryByStopCode: false,
};

const baseProps = {
  currentTime: 1000,
  relay: { refetch: () => {}, environment: {} },
  match: { ...mockMatch, params: { stopId: 'HSL:1234' } },
};

// An alert with effectiveStartDate:0 is always treated as valid by isAlertValid
const makeAlert = (alertSeverityLevel, alertEffect = null) => ({
  alertSeverityLevel,
  alertEffect,
  effectiveStartDate: 0,
  effectiveEndDate: 9999999999,
});

const render = (stopProps, config = baseConfig) =>
  shallowWithIntl(
    <StopPageContentContainer
      {...baseProps}
      stop={{ routes: [], ...stopProps }}
    />,
    { context: { config } },
  );

describe('<StopPageContentContainer />', () => {
  it("should show a 'no departures' indicator when stoptimes is empty", () => {
    const wrapper = render({});
    expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(1);
  });

  it('should show no badge and "no-departures" text when showStopStatusMarkers is false', () => {
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

  it('should show clock badge and "stop-no-service-today" text when no active alerts but service exists in the future', () => {
    const wrapper = render(
      { alerts: [], futureStoptimes: [{ serviceDay: 1 }] },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
    ).to.equal('icon_stop-temporarily-closed-badge');
    expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
      STOP_STATUS.NO_SERVICE_TODAY,
    );
  });

  it('should show closed badge and "stop-out-of-service" text when no alerts and no future service', () => {
    const wrapper = render(
      { alerts: [], futureStoptimes: [] },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
    ).to.equal('icon_stop-closed-badge');
    expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
      STOP_STATUS.OUT_OF_SERVICE,
    );
  });

  it('should show closed badge and "stop-out-of-service" text for NO_SERVICE alert', () => {
    const wrapper = render(
      { alerts: [makeAlert(AlertSeverityLevelType.Warning, 'NO_SERVICE')] },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
    ).to.equal('icon_stop-closed-badge');
    expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
      STOP_STATUS.OUT_OF_SERVICE,
    );
  });

  it('should show caution badge and "stop-has-alert" text for a warning alert without effect', () => {
    const wrapper = render(
      { alerts: [makeAlert(AlertSeverityLevelType.Warning)] },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
    ).to.equal('icon_caution-badge');
    expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
      STOP_STATUS.ALERT,
    );
  });

  it('should show the alertEffect-based message id for a warning alert with an effect', () => {
    const wrapper = render(
      {
        alerts: [
          makeAlert(AlertSeverityLevelType.Warning, 'SIGNIFICANT_DELAYS'),
        ],
      },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    const statusComp = wrapper.find(StopScheduleStatus);
    expect(statusComp.prop('status')).to.equal(STOP_STATUS.ALERT);
    expect(statusComp.prop('alertEffects')).to.deep.equal([
      'SIGNIFICANT_DELAYS',
    ]);
  });

  it('should show info badge and "stop-has-info" text for an info-level alert', () => {
    const wrapper = render(
      { alerts: [makeAlert(AlertSeverityLevelType.Info)] },
      { ...baseConfig, showStopStatusMarkers: true },
    );
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge').prop('img'),
    ).to.equal('icon_info-circled-badge');
    expect(wrapper.find(StopScheduleStatus).prop('status')).to.equal(
      STOP_STATUS.INFO,
    );
  });

  it('should show the departure list when stoptimes are present', () => {
    const stoptimes = [
      { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
    ];
    const wrapper = render({ stoptimes });
    expect(wrapper.find(DepartureListContainer)).to.have.lengthOf(1);
    expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(0);
  });
});
