import React from 'react';
import L from 'leaflet';
import { LeafletProvider } from 'react-leaflet/es/context';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { mockContext } from '../../../helpers/mock-context';
import {
  Component,
  sendSelectionAnalytics,
} from '../../../../../app/component/map/tile-layer/TileLayerContainer';
import * as analytics from '../../../../../utils/shared/analyticsUtils';

describe('<TileLayerContainer />', () => {
  const config = { ...mockContext.config, vehicleRental: {} };

  const createMap = () => ({
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    addEventParent: vi.fn(),
    removeEventParent: vi.fn(),
    closePopup: vi.fn(),
    options: { maxZoom: null, minZoom: null },
  });

  const baseProps = {
    tileSize: 1,
    zoomOffset: 1,
    mapLayers: { stop: {}, terminal: {} },
    currentTime: 123457890,
  };

  const renderLayer = (map, props = {}) => {
    const element = p => (
      <LeafletProvider value={{ map }}>
        <Component {...baseProps} {...p} />
      </LeafletProvider>
    );
    const result = renderWithProviders(element(props), { config });
    return {
      ...result,
      update: p => result.rerender(element({ ...props, ...p })),
    };
  };

  describe('sendSelectionAnalytics', () => {
    afterEach(() => vi.restoreAllMocks());

    it('should send analytics for a terminal stop target', () => {
      const spy = vi.spyOn(analytics, 'addAnalyticsEvent');
      sendSelectionAnalytics(
        [
          {
            layer: 'stop',
            feature: { properties: { stops: 'HSL:1234', type: 'BUS' } },
          },
        ],
        config,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: 'BUS_TERMINAL',
        source: 'index',
      });
    });

    it('should send analytics for multiple targets', () => {
      const spy = vi.spyOn(analytics, 'addAnalyticsEvent');
      const target = { layer: 'stop', feature: { properties: {} } };
      sendSelectionAnalytics([target, target], config);
      expect(spy.mock.calls[0][0]).toMatchObject({ name: 'multiple' });
    });

    it('should not send analytics when there are no selected targets', () => {
      const spy = vi.spyOn(analytics, 'addAnalyticsEvent');
      sendSelectionAnalytics([], config);
      sendSelectionAnalytics(undefined, config);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('leaflet layer lifecycle', () => {
    afterEach(() => vi.restoreAllMocks());

    it('should add the layer on mount and remove it on unmount', () => {
      const map = createMap();
      const { unmount } = renderLayer(map);
      expect(map.addLayer).toHaveBeenCalledTimes(1);
      expect(map.addEventParent).toHaveBeenCalledTimes(1);
      const layer = map.addLayer.mock.calls[0][0];
      expect(layer).toBeInstanceOf(L.GridLayer);
      expect(map.addEventParent).toHaveBeenCalledWith(layer);

      unmount();
      expect(map.removeLayer).toHaveBeenCalledWith(layer);
      expect(map.removeEventParent).toHaveBeenCalledWith(layer);
    });

    it('should redraw only when mapLayers or highlightedStops change', () => {
      const redraw = vi.spyOn(L.GridLayer.prototype, 'redraw');
      const { update } = renderLayer(createMap());
      expect(redraw).not.toHaveBeenCalled();

      update({ mapLayers: { stop: {}, terminal: {} } });
      expect(redraw).not.toHaveBeenCalled();

      const changedLayers = { stop: {}, terminal: {}, citybike: true };
      update({ mapLayers: changedLayers });
      expect(redraw).toHaveBeenCalledTimes(1);

      update({ mapLayers: changedLayers, highlightedStops: ['HSL:1'] });
      expect(redraw).toHaveBeenCalledTimes(2);
    });

    it('should notify active tile layers when time changes', () => {
      const map = createMap();
      const { update } = renderLayer(map);
      const layer = map.addLayer.mock.calls[0][0];
      const onTimeChange = vi.fn();
      // eslint-disable-next-line no-underscore-dangle
      layer._tiles = {
        a: { active: true, el: { layers: [{ onTimeChange }] } },
        b: { active: false, el: { layers: [{ onTimeChange }] } },
      };
      update({ currentTime: baseProps.currentTime + 1 });
      expect(onTimeChange).toHaveBeenCalledTimes(1);
      expect(onTimeChange).toHaveBeenCalledWith(config.language);
    });
  });
});
