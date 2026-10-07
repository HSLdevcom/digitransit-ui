import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';

import { renderWithProviders } from '../helpers/mock-providers';

import { Component as MapLayersDialogContent } from '../../../app/component/map/MapLayersDialogContent';

const testConfig = { CONFIG: 'default', language: 'fi' };

const renderMapLayersDialogContent = (props, config = testConfig) => {
  window.localStorage.setItem(
    'map-layers',
    JSON.stringify(props.storedMapLayers || props.mapLayers || {}),
  );
  return renderWithProviders(
    <MapLayersDialogContent
      mapLayers={props.mapLayers}
      mapLayerOptions={props.mapLayerOptions}
      setOpen={props.setOpen}
    />,
    { config: { ...testConfig, ...config } },
  );
};

const getStoredMapLayers = () =>
  JSON.parse(window.localStorage.getItem('map-layers'));

describe('<MapLayersDialogContent />', () => {
  beforeAll(() => fetchMock.mockGlobal());

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  afterAll(() => fetchMock.unmockGlobal());

  it('should render', () => {
    const props = {
      setOpen: () => {},
      mapLayers: {
        stop: {},
        terminal: {},
      },
    };
    const { container } = renderMapLayersDialogContent(props);

    expect(container.querySelector('.map-layer-header')).not.toBeNull();
  });

  it('should update the vehicles layer', () => {
    const mapLayers = {
      showAllBusses: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      vehicles: true,
    });
    const checkbox = container.querySelectorAll(
      '.option-checkbox.large input',
    )[0];
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().vehicles).toBe(true);
  });

  it('should update the bus stop layer', () => {
    const mapLayers = {
      stop: {
        bus: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      transportModes: {
        bus: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().stop.bus).toBe(true);
  });

  it('should show the passed effective state of a locked stop layer', () => {
    const props = {
      setOpen: () => {},
      mapLayers: {
        stop: { bus: false },
        terminal: {},
      },
      storedMapLayers: {
        stop: { bus: true },
        terminal: {},
      },
      mapLayerOptions: {
        stop: {
          bus: {
            isLocked: true,
            isSelected: false,
          },
        },
      },
    };
    const { container } = renderMapLayersDialogContent(props, {
      transportModes: {
        bus: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');

    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(true);
  });

  it('should update the tram stop layer', () => {
    const mapLayers = {
      stop: {
        tram: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      transportModes: {
        tram: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().stop.tram).toBe(true);
  });

  it('should update the ferry stop layer', () => {
    const mapLayers = {
      stop: {
        ferry: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      transportModes: {
        ferry: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().stop.ferry).toBe(true);
  });

  it('should update the airplane stop layer', () => {
    const mapLayers = {
      stop: {
        airplane: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      transportModes: {
        airplane: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().stop.airplane).toBe(true);
  });

  it('should update the citybike layer', () => {
    const today = new Date();
    const yesterday = new Date();
    const tomorrow = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const mapLayers = {
      citybike: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      vehicleRental: {
        networks: {
          foo: {
            type: 'citybike',
            enabled: true,
            season: {
              start: `${today.getDate()}.${
                today.getMonth() + 1
              }.${today.getFullYear()}`,
              end: `${tomorrow.getDate()}.${
                tomorrow.getMonth() + 1
              }.${tomorrow.getFullYear()}`,
              preSeasonStart: `${yesterday.getDate()}.${
                yesterday.getMonth() + 1
              }.${yesterday.getFullYear()}`,
            },
          },
        },
      },
      transportModes: {
        citybike: {
          availableForSelection: true,
        },
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().citybike).toBe(true);
  });

  it('should update the park&ride layer', () => {
    const mapLayers = {
      parkAndRide: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    const { container } = renderMapLayersDialogContent(props, {
      parkAndRide: {
        showParkAndRide: true,
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(getStoredMapLayers().parkAndRide).toBe(true);
  });

  it('should include geoJson layers', async () => {
    const mapLayers = {
      terminal: {},
      s: {},
      stop: {},
      geoJson: {
        'https://localhost/somejson': true,
        'https://localhost/morejson': false,
      },
    };
    const props = {
      setOpen: () => {},
      mapLayers,
    };
    fetchMock.get('https://localhost/somejson', {
      type: 'FeatureCollection',
      features: [],
    });
    fetchMock.get('https://localhost/morejson', {
      type: 'FeatureCollection',
      features: [],
    });
    const { container } = renderMapLayersDialogContent(props, {
      geoJson: {
        layers: [
          {
            name: {
              fi: 'testi',
              sv: 'test',
              en: 'test',
            },
            url: 'https://localhost/somejson',
          },
          {
            name: {
              fi: 'nimi',
              sv: 'namn',
              en: 'name',
            },
            url: 'https://localhost/morejson',
          },
        ],
      },
    });
    await waitFor(() => {
      expect(
        container.querySelectorAll('.option-checkbox.large input'),
      ).toHaveLength(2);
    });
    const checkboxes = container.querySelectorAll(
      '.option-checkbox.large input',
    );

    fireEvent.click(checkboxes[1]);

    expect(getStoredMapLayers().geoJson['https://localhost/morejson']).toBe(
      true,
    );
  });
});
