import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as TerminalPageContent } from '../../../app/component/stop/TerminalPageContentContainer';
import DepartureListContainer from '../../../app/component/DepartureListContainer';
import StopServiceStatusBanner from '../../../app/component/stop/StopServiceStatusBanner';

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
  it('renders StopServiceStatusBanner in no-departures mode when stoptimes is empty', () => {
    const wrapper = render({});
    expect(wrapper.find(StopServiceStatusBanner)).to.have.lengthOf(1);
    expect(
      wrapper.find(StopServiceStatusBanner).prop('stoptimes'),
    ).to.deep.equal([]);
  });

  it('passes servicesRunningInFuture=false when futureStoptimes is empty', () => {
    const wrapper = render({ futureStoptimes: [] });
    expect(
      wrapper.find(StopServiceStatusBanner).prop('servicesRunningInFuture'),
    ).to.equal(false);
  });

  it('passes servicesRunningInFuture=true when futureStoptimes has entries', () => {
    const wrapper = render({ futureStoptimes: [{ serviceDay: 1 }] });
    expect(
      wrapper.find(StopServiceStatusBanner).prop('servicesRunningInFuture'),
    ).to.equal(true);
  });

  it('shows departure list when stoptimes are present', () => {
    const stoptimes = [
      { serviceDay: 0, realtimeState: 'SCHEDULED', trip: { pattern: {} } },
    ];
    const wrapper = render({ stoptimes });
    expect(wrapper.find(DepartureListContainer)).to.have.lengthOf(1);
  });
});
