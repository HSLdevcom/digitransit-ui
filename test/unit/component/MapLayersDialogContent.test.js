import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import {
  Component as MapLayersDialogContent,
  getGeoJsonLayersOrDefault,
} from '../../../app/component/map/MapLayersDialogContent';

const testConfig = { CONFIG: 'default', language: 'fi' };

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
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find('.map-layer-header')).toHaveLength(1);
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
    const context = {
      config: {
        ...testConfig,
        vehicles: true,
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });
    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.vehicles).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.bus).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
        transportModes: {
          tram: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.tram).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
        transportModes: {
          ferry: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.ferry).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
        transportModes: {
          airplane: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.airplane).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
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
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });
    expect(mapLayers.citybike).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
        parkAndRide: {
          showParkAndRide: true,
        },
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.parkAndRide).toBe(true);
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
    const context = {
      config: {
        ...testConfig,
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
      },
    };
    const wrapper = mountWithIntl(<MapLayersDialogContent {...props} />, {
      context: { ...mockContext, ...context },
      config: context.config,
      childContextTypes: { ...mockChildContextTypes },
    });
    const checkboxes = wrapper.find('.option-checkbox.large input');
    expect(checkboxes.length).toBe(2);

    checkboxes.at(1).simulate('change', { target: { checked: true } });

    expect(mapLayers.geoJson.morejson).toBe(true);
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
      expect(getGeoJsonLayersOrDefault(config, store)).toBe(
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
      expect(getGeoJsonLayersOrDefault(config, store)).toBe(store.layers);
    });

    it('should return the defaultValue', () => {
      const store = {};
      const defaultValue = [];
      expect(getGeoJsonLayersOrDefault(testConfig, store, defaultValue)).toBe(
        defaultValue,
      );
    });
  });
});
