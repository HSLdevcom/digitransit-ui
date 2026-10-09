import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import { useMapLayers } from '../../../app/hooks/MapLayerContext';

function MapLayerConsumer() {
  const { mapLayers } = useMapLayers();
  const { mapLayers: overriddenMapLayers } = useMapLayers({
    notThese: ['stop'],
    force: ['terminal'],
  });
  const { updateMapLayers } = useMapLayers();

  return (
    <>
      <pre data-testid="map-layers">{JSON.stringify(mapLayers)}</pre>
      <pre data-testid="overridden-map-layers">
        {JSON.stringify(overriddenMapLayers)}
      </pre>
      <button
        onClick={() =>
          updateMapLayers({
            stop: { bus: false },
            geoJson: { 'https://example.com/zones': true },
          })
        }
        type="button"
      >
        Update map layers
      </button>
    </>
  );
}

describe('MapLayerContext', () => {
  it('initializes config defaults and restores saved settings', () => {
    window.localStorage.setItem(
      'map-layers',
      JSON.stringify({
        terminal: { tram: false },
        geoJson: { 'https://example.com/zones': true },
      }),
    );
    const { getByTestId } = renderWithProviders(<MapLayerConsumer />, {
      config: {
        ...mockContext.config,
        hideMapLayersByDefault: true,
      },
    });

    const mapLayers = JSON.parse(getByTestId('map-layers').textContent);
    expect(mapLayers.stop).toEqual({
      bus: false,
      ferry: false,
      rail: false,
      subway: false,
      tram: false,
      funicular: false,
      airplane: false,
    });
    expect(mapLayers.terminal).toEqual({
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: false,
      airplane: true,
    });
    expect(mapLayers.geoJson['https://example.com/zones']).toBe(true);
  });

  it('enables configured rental-vehicle layers by default', () => {
    const { getByTestId } = renderWithProviders(<MapLayerConsumer />, {
      config: {
        ...mockContext.config,
        vehicleRental: {
          networks: {
            citybike: {
              type: 'citybike',
              enabled: true,
              showRentalVehicles: true,
            },
            scooter: {
              type: 'scooter',
              enabled: true,
              showRentalVehicles: true,
            },
          },
        },
        transportModes: {
          ...mockContext.config.transportModes,
          scooter: {
            ...mockContext.config.transportModes.scooter,
            showIfSelectedForRouting: true,
          },
        },
      },
    });
    const mapLayers = JSON.parse(getByTestId('map-layers').textContent);

    expect(mapLayers.citybike).toBe(true);
    expect(mapLayers.scooter).toBe(true);
  });

  it('applies per-map overrides without changing saved settings', () => {
    const { getByTestId } = renderWithProviders(<MapLayerConsumer />, {
      config: mockContext.config,
    });

    const mapLayers = JSON.parse(getByTestId('map-layers').textContent);
    const overriddenMapLayers = JSON.parse(
      getByTestId('overridden-map-layers').textContent,
    );
    expect(overriddenMapLayers.stop).toEqual({
      bus: false,
      ferry: false,
      rail: false,
      subway: false,
      tram: false,
      funicular: false,
      airplane: false,
    });
    expect(overriddenMapLayers.terminal).toEqual({
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      airplane: true,
    });
    expect(mapLayers.stop.bus).toBe(true);
    expect(mapLayers.terminal.bus).toBe(true);
  });

  it('merges nested updates and persists the complete settings', () => {
    const { getByTestId, getByRole } = renderWithProviders(
      <MapLayerConsumer />,
      {
        config: mockContext.config,
      },
    );

    fireEvent.click(getByRole('button', { name: 'Update map layers' }));

    const mapLayers = JSON.parse(getByTestId('map-layers').textContent);
    const storedMapLayers = JSON.parse(
      window.localStorage.getItem('map-layers'),
    );
    expect(mapLayers.stop.bus).toBe(false);
    expect(mapLayers.stop.tram).toBe(true);
    expect(mapLayers.geoJson['https://example.com/zones']).toBe(true);
    expect(storedMapLayers).toEqual(mapLayers);
  });
});
