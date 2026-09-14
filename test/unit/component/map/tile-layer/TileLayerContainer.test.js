import React from 'react';
import sinon from 'sinon';

import { renderWithProviders } from '../../../helpers/mock-providers';
import { mockContext } from '../../../helpers/mock-context';
import { Component } from '../../../../../app/component/map/tile-layer/TileLayerContainer';
import * as analytics from '../../../../../app/util/analyticsUtils';

describe('<TileLayerContainer />', () => {
  const props = {
    tileSize: 1,
    zoomOffset: 1,
    mapLayers: { stop: {}, terminal: {} },
    leaflet: {
      map: {
        addLayer: () => null,
        addEventParent: () => null,
        closePopup: () => null,
        off: () => null,
        removeEventParent: () => null,
        options: { maxZoom: null, minZoom: null },
      },
    },
    lang: 'fi',
    currentTime: 123457890,
  };

  it('should send analytics for a terminal stop target', () => {
    const spy = sinon.spy(analytics, 'addAnalyticsEvent');
    const componentRef = React.createRef();
    renderWithProviders(
      <Component {...props} relayEnvironment={{}} ref={componentRef} />,
      {
        config: { ...mockContext.config, vehicleRental: {} },
        context: { popupContainer: { openPopup: () => {} } },
      },
    );
    componentRef.current.state.selectableTargets = [
      {
        layer: 'stop',
        feature: {
          properties: {
            stops: 'HSL:1234',
            type: 'BUS',
          },
        },
      },
    ];
    componentRef.current.PopupOptions.onOpen();
    expect(spy.calledOnce).to.equal(true);
    expect(spy.firstCall.args[0]).to.deep.equal({
      action: 'SelectMapPoint',
      category: 'Map',
      name: 'stop',
      type: 'BUS_TERMINAL',
      source: 'index',
    });
    spy.restore();
  });

  it('should not send analytics when there are no selected targets', () => {
    const spy = sinon.spy(analytics, 'addAnalyticsEvent');
    const componentRef = React.createRef();
    renderWithProviders(
      <Component {...props} relayEnvironment={{}} ref={componentRef} />,
      {
        config: { ...mockContext.config, vehicleRental: {} },
        context: { popupContainer: { openPopup: () => {} } },
      },
    );
    componentRef.current.state.selectableTargets = [];
    componentRef.current.PopupOptions.onOpen();
    expect(spy.notCalled).to.equal(true);
    spy.restore();
  });
});
