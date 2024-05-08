import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../../helpers/mock-context';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import { Component as MapWithTracking } from '../../../../app/component/map/MapWithTracking';

const defaultProps = {
  getGeoJsonConfig: () => {},
  getGeoJsonData: () => {},
  position: {
    hasLocation: false,
    isLocationingInProgress: false,
    lat: 60,
    lon: 25,
  },
  lat: 60,
  lon: 25,
  zoom: 12,
  mapLayers: { stop: {}, terminal: {} },
  breakpoint: 'large',
  lang: 'fi',
};

const defaultContext = {
  ...mockContext,
  config: {
    CONFIG: 'default',
    realTime: {
      tampere: {
        gtfsRt: 'foobar',
        routeSelector: () => '32',
        active: false,
      },
    },
    vehicles: false,
    feedIds: [],
    map: {
      // DT-3470
      showZoomControl: true,
    },
    stopsMinZoom: 12,
  },
  executeAction: sinon.stub(),
};

describe('<MapWithTracking />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<MapWithTracking {...defaultProps} />, {
      context: { ...defaultContext },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
