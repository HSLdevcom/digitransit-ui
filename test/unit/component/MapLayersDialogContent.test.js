import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { fireEvent } from '@testing-library/react';

import { renderWithProviders } from '../helpers/mock-providers';

import {
  Component as MapLayersDialogContent,
  getGeoJsonLayersOrDefault,
} from '../../../app/component/map/MapLayersDialogContent';

const testConfig = { CONFIG: 'default', language: 'fi' };

const renderMapLayersDialogContent = (props, config = testConfig) =>
  renderWithProviders(<MapLayersDialogContent {...props} />, {
    config: { ...testConfig, ...config },
  });

describe('<MapLayersDialogContent />', () => {
  it('should render', () => {
    const props = {
      setOpen: () => {},
      mapLayers: {
        stop: {},
        terminal: {},
      },
      updateLayers: () => {},
    };
    const { container } = renderMapLayersDialogContent(props);

    expect(container.querySelector('.map-layer-header')).to.not.equal(null);
  });

  it('should update the vehicles layer', () => {
    let mapLayers = {
      showAllBusses: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const { container } = renderMapLayersDialogContent(props, {
      vehicles: true,
    });
    const checkbox = container.querySelectorAll(
      '.option-checkbox.large input',
    )[0];
    fireEvent.click(checkbox);

    expect(mapLayers.vehicles).to.equal(true);
  });

  it('should update the bus stop layer', () => {
    let mapLayers = {
      stop: {
        bus: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
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
    fireEvent.click(checkbox);

    expect(mapLayers.stop.bus).to.equal(true);
  });

  it('should update the tram stop layer', () => {
    let mapLayers = {
      stop: {
        tram: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
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

    expect(mapLayers.stop.tram).to.equal(true);
  });

  it('should update the ferry stop layer', () => {
    let mapLayers = {
      stop: {
        ferry: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
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

    expect(mapLayers.stop.ferry).to.equal(true);
  });

  it('should update the airplane stop layer', () => {
    let mapLayers = {
      stop: {
        airplane: false,
      },
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
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

    expect(mapLayers.stop.airplane).to.equal(true);
  });

  it('should update the citybike layer', () => {
    const today = new Date();
    const yesterday = new Date();
    const tomorrow = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() + 1);
    let mapLayers = {
      citybike: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
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

    expect(mapLayers.citybike).to.equal(true);
  });

  it('should update the park&ride layer', () => {
    let mapLayers = {
      parkAndRide: false,
      stop: {},
      terminal: {},
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const { container } = renderMapLayersDialogContent(props, {
      parkAndRide: {
        showParkAndRide: true,
      },
    });
    const checkbox = container.querySelector('.option-checkbox.large input');
    fireEvent.click(checkbox);

    expect(mapLayers.parkAndRide).to.equal(true);
  });

  it('should include geoJson layers', () => {
    let mapLayers = {
      terminal: {},
      s: {},
      stop: {},
      geoJson: {
        somejson: true,
        morejson: false,
      },
    };
    const props = {
      setOpen: () => {},
      mapLayers,
      updateLayers: layers => {
        mapLayers = { ...layers };
      },
      geoJson: {
        somejson: {
          name: {
            fi: 'testi',
            sv: 'test',
            en: 'test',
          },
        },
        morejson: {
          name: {
            fi: 'nimi',
            sv: 'namn',
            en: 'name',
          },
        },
      },
    };
    const { container } = renderMapLayersDialogContent(props, {
      geoJson: {
        layers: [
          {
            name: {
              fi: 'testi',
              sv: 'test',
              en: 'test',
            },
            url: 'somejson',
          },
          {
            name: {
              fi: 'nimi',
              sv: 'namn',
              en: 'name',
            },
            url: 'morejson',
          },
        ],
      },
    });
    const checkboxes = container.querySelectorAll(
      '.option-checkbox.large input',
    );
    expect(checkboxes.length).to.equal(2);

    fireEvent.click(checkboxes[1]);

    expect(mapLayers.geoJson.morejson).to.equal(true);
  });

  describe('getGeoJsonLayersOrDefault', () => {
    it('should return the layers from the configuration', () => {
      const config = {
        ...testConfig,
        geoJson: {
          layers: [
            {
              foo: 'bar',
            },
          ],
        },
      };
      const store = { layers: undefined };
      expect(getGeoJsonLayersOrDefault(config, store)).to.equal(
        config.geoJson.layers,
      );
    });

    it('should return the layers from the store', () => {
      const config = {
        ...testConfig,
        geoJson: {
          layerConfigUrl: 'foobar',
        },
      };
      const store = {
        layers: [
          {
            foo: 'bar',
          },
        ],
      };
      expect(getGeoJsonLayersOrDefault(config, store)).to.equal(store.layers);
    });

    it('should return the defaultValue', () => {
      const store = {};
      const defaultValue = [];
      expect(
        getGeoJsonLayersOrDefault(testConfig, store, defaultValue),
      ).to.equal(defaultValue);
    });
  });
});
