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
  config: {
    defaultEndpoint: {},
    realTime: {},
    feedIds: [],
    stopsMinZoom: 0,
    showAllBusses: false,
  },
  mapLayers: {
    geoJson: {},
    stop: {},
    terminal: {},
    ticketSales: {},
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

  it('should use the configured geojson layers', async () => {
    const layerUrl = 'testLayerUrl';

    const props = {
      ...defaultProps,
      getGeoJsonConfig: sinon.stub(),
      getGeoJsonData: url =>
        url === layerUrl && {
          type: 'FeatureCollection',
          features: [],
        },
      config: {
        ...defaultProps.config,
        geoJson: {
          layers: [
            {
              name: {
                fi: 'Testi',
                en: 'Test',
              },
              url: layerUrl,
              isOffByDefault: false,
            },
          ],
        },
      },
    };

    const wrapper = shallowWithIntl(<MapWithTracking {...props} />, {
      context: { ...defaultContext },
    });
    await wrapper.instance().componentDidMount();

    expect(props.getGeoJsonConfig.called).to.equal(false);
    expect(wrapper.state().geoJson).to.deep.equal({
      [layerUrl]: {
        type: 'FeatureCollection',
        isOffByDefault: false,
        features: [],
      },
    });
  });

  it('should retrieve an external geojson layer configuration', async () => {
    const layerConfigUrl = 'testLayerConfigUrl';
    const layerUrl = 'testLayerUrl';

    const props = {
      ...defaultProps,
      getGeoJsonConfig: url =>
        url === layerConfigUrl && [
          {
            name: {
              fi: 'Testi',
              en: 'Test',
            },
            url: layerUrl,
          },
        ],
      getGeoJsonData: url =>
        url === layerUrl && {
          type: 'FeatureCollection',
          features: [],
        },
      config: {
        ...defaultProps.config,
        geoJson: {
          layerConfigUrl,
        },
      },
    };

    const wrapper = shallowWithIntl(<MapWithTracking {...props} />, {
      context: { ...defaultContext },
    });
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().geoJson).to.deep.equal({
      [layerUrl]: {
        type: 'FeatureCollection',
        isOffByDefault: undefined,
        features: [],
      },
    });
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
