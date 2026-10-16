import React from 'react';
import fetchMock from 'fetch-mock';

import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import { useConfigContext } from '../../../app/client/ConfigContext';
import useGeoJsonObjects from '../../../app/hooks/useGeoJsonObjects';

function GeoJsonConsumer() {
  const config = useConfigContext();
  const geoJson = useGeoJsonObjects(config.geoJson);
  return <div>{JSON.stringify(geoJson)}</div>;
}

describe('useGeoJsonObjects', () => {
  beforeAll(() => fetchMock.mockGlobal());

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  afterAll(() => fetchMock.unmockGlobal());

  it('loads configured remote layers', async () => {
    const configUrl = 'https://localhost/layers';
    const dataUrl = 'https://localhost/layer-remote.geojson';
    fetchMock.get(configUrl, {
      geoJson: {
        layers: [{ name: 'Test layer', url: dataUrl }],
      },
    });
    fetchMock.get(dataUrl, {
      type: 'FeatureCollection',
      features: [],
    });

    const { findByText } = renderWithProviders(<GeoJsonConsumer />, {
      config: {
        ...mockContext.config,
        geoJson: { layerConfigUrl: configUrl },
      },
    });

    expect(await findByText(/Test layer/)).toBeTruthy();
    expect(fetchMock.callHistory.calls()).toHaveLength(2);
  });

  it('reuses cached layer data after a consumer remounts', async () => {
    const dataUrl = 'https://localhost/layer-cache.geojson';
    fetchMock.get(dataUrl, { type: 'FeatureCollection', features: [] });
    const { findByText, rerender } = renderWithProviders(
      <GeoJsonConsumer key="map" />,
      {
        config: {
          ...mockContext.config,
          geoJson: {
            layers: [
              {
                name: 'Test layer',
                url: dataUrl,
                isOffByDefault: true,
              },
            ],
          },
        },
      },
    );

    expect(await findByText(/"isOffByDefault":true/)).toBeTruthy();
    rerender(<GeoJsonConsumer key="dialog" />);
    expect(await findByText(/Test layer/)).toBeTruthy();
    expect(fetchMock.callHistory.calls()).toHaveLength(1);
  });

  it('does not fetch when no GeoJSON layers are configured', () => {
    const { getByText } = renderWithProviders(<GeoJsonConsumer />, {
      config: { ...mockContext.config, geoJson: undefined },
    });

    expect(getByText('null')).toBeTruthy();
    expect(fetchMock.callHistory.calls()).toHaveLength(0);
  });
});
