import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';
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
  leafletObjs: [],
  mapLayers: { stop: {}, terminal: {} },
  breakpoint: 'large',
  lang: 'fi',
};

describe('<MapWithTracking />', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  before(() => {
    HTMLCanvasElement.prototype.getContext = () => ({});
    global.requestAnimationFrame = callback => setTimeout(callback, 0);
    global.cancelAnimationFrame = id => clearTimeout(id);
  });

  after(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it('should render', () => {
    const { container } = renderWithProviders(
      <MapWithTracking {...defaultProps} />,
      {
        config: {
          ...mockContext.config,
          realTime: {},
          vehicles: false,
          feedIds: [],
          map: { ...mockContext.config.map, showZoomControl: true },
          stopsMinZoom: 12,
        },
      },
    );
    expect(container.innerHTML).to.not.equal('');
  });
});
