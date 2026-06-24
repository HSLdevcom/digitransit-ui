import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as TerminalPageContent } from '../../../app/component/stop/TerminalPageContentContainer';
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
};

const render = (stationProps, config = baseConfig) =>
  shallowWithIntl(
    <TerminalPageContent
      {...baseProps}
      station={{
        routes: [],
        vehicleMode: 'BUS',
        alerts: [],
        futureStoptimes: [],
        ...stationProps,
      }}
    />,
    { config },
  );

describe('<TerminalPageContentContainer />', () => {
  it('shows no-departures container when stoptimes is empty', () => {
    const wrapper = render({});
    expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(1);
  });

  it('shows no badge and "no-departures" text when showStopStatusMarkers is false', () => {
    const wrapper = render({ alerts: [] });
    expect(
      wrapper.find(Icon).filter('.stop-no-departures-badge'),
    ).to.have.lengthOf(0);
    expect(wrapper.find('FormattedMessage').prop('id')).to.equal(
      'no-departures',
    );
  });

  it('shows closed badge and OUT_OF_SERVICE status when no future service', () => {
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

  it('shows clock badge and NO_SERVICE_TODAY status when future service exists', () => {
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

  it('shows departure list when stoptimes are present', () => {
    const stoptimes = [
      { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
    ];
    const wrapper = render({ stoptimes });
    expect(wrapper.find(DepartureListContainer)).to.have.lengthOf(1);
    expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(0);
  });
});
