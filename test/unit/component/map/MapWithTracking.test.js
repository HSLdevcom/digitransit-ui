import React from 'react';
import sinon from 'sinon';

import { mockContext } from '../../helpers/mock-context';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import { Component as MapWithTracking } from '../../../../app/component/map/MapWithTracking';

const defaultProps = {
  getGeoJsonConfig: () => {},
  getGeoJsonData: () => {},
  origin: {},
  destination: {},
  position: {
    hasLocation: false,
    isLocationingInProgress: false,
    lat: 60,
    lon: 25,
  },
  defaultMapCenter: {
    lat: 60,
    lon: 25,
  },
  config: {
    defaultEndpoint: {},
    realTime: {},
    feedIds: [],
    stopsMinZoom: 0,
    showAllBusses: false,
    map: {
      // DT-3470
      showZoomControl: true,
    },
  },
  mapLayers: {
    geoJson: {},
    stop: {},
    terminal: {},
    showAllBusses: false,
  },
};

const defaultContext = {
  ...mockContext,
  config: {
    realTime: {
      tampere: {
        gtfsRt: 'foobar',
        routeSelector: () => '32',
        active: false,
      },
    },
    showAllBusses: false,
    map: {
      // DT-3470
      showZoomControl: true,
    },
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

  it('should update the current bounds', () => {
    const bounds = [1, 2];

    const wrapper = shallowWithIntl(<MapWithTracking {...defaultProps} />, {
      context: { ...defaultContext },
    });
    const instance = wrapper.instance();
    instance.mapElement = {
      leafletElement: {
        getBounds: () => bounds,
      },
    };
    instance.updateCurrentBounds();

    expect(wrapper.state().bounds).to.equal(bounds);
  });

  it('should not update the current bounds if they are equal', () => {
    const initialBounds = {
      value: 'foobar',
      equals: () => true,
    };
    const newBounds = {
      value: 'foobar',
    };

    const wrapper = shallowWithIntl(<MapWithTracking {...defaultProps} />, {
      context: { ...defaultContext },
    });
    wrapper.setState({ bounds: initialBounds });

    const instance = wrapper.instance();
    instance.mapElement = {
      leafletElement: {
        getBounds: () => newBounds,
      },
    };
    instance.updateCurrentBounds();

    expect(wrapper.state().bounds).to.equal(initialBounds);
  });
});
