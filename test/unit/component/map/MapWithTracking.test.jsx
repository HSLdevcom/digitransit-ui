import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';
import {
  Component as MapWithTracking,
  getForcedLayersFromMapLayerOptions,
} from '../../../../app/component/map/MapWithTracking';

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

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => ({});
    global.requestAnimationFrame = callback => setTimeout(callback, 0);
    global.cancelAnimationFrame = id => clearTimeout(id);
  });

  afterAll(() => {
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
    expect(container.innerHTML).not.toBe('');
  });

  it('should return selected values for locked map layers', () => {
    expect(
      getForcedLayersFromMapLayerOptions({
        vehicles: { isLocked: true, isSelected: false },
        stop: {
          bus: { isLocked: true, isSelected: true },
          tram: { isLocked: false, isSelected: false },
        },
      }),
    ).toEqual({
      vehicles: false,
      stop: { bus: true },
    });
  });

  it('should show that tracking is off by default', () => {
    const { getByRole } = renderWithProviders(
      <MapWithTracking {...defaultProps} mapTracking={false} />,
      {
        config: {
          ...mockContext.config,
          map: { ...mockContext.config.map, showLayerSelector: false },
        },
      },
    );

    expect(getByRole('button', { name: 'tracking off' })).not.to.equal(null);
  });

  it('should show that tracking is on when enabled', () => {
    const { getByRole } = renderWithProviders(
      <MapWithTracking {...defaultProps} mapTracking />,
      {
        config: {
          ...mockContext.config,
          map: { ...mockContext.config.map, showLayerSelector: false },
        },
      },
    );

    expect(getByRole('button', { name: 'tracking on' })).not.to.equal(null);
  });

  it('should show a failed location label when locationing fails', () => {
    const { getByRole } = renderWithProviders(
      <MapWithTracking
        {...defaultProps}
        position={{ ...defaultProps.position, locationingFailed: true }}
      />,
      {
        config: {
          ...mockContext.config,
          map: { ...mockContext.config.map, showLayerSelector: false },
        },
      },
    );

    expect(getByRole('button', { name: 'tracking failed' })).not.to.equal(null);
  });
});
