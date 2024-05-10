import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import {
  Component as MapLayersDialogContent,
  getGeoJsonLayersOrDefault,
} from '../../../app/component/MapLayersDialogContent';

describe('<MapLayersDialogContent />', () => {
  it('should render', () => {
    const props = {
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers: {
        stop: {},
        terminal: {},
      },
      updateMapLayers: () => {},
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    expect(wrapper.find('.map-layer-header')).to.have.lengthOf(1);
  });

  it('should update the vehicles layer', () => {
    let mapLayers = {
      showAllBusses: false,
      stop: {},
      terminal: {},
    };
    const props = {
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        vehicles: true,
      },
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

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
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

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
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        transportModes: {
          tram: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

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
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        transportModes: {
          ferry: {
            availableForSelection: true,
          },
        },
      },
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.ferry).to.equal(true);
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
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        cityBike: {
          networks: {
            foo: {
              enabled: true,
              season: {
                start: `${today.getDate()}.${today.getMonth() + 1}`,
                end: `${tomorrow.getDate()}.${tomorrow.getMonth() + 1}`,
                preSeasonStart: `${yesterday.getDate()}.${
                  yesterday.getMonth() + 1
                }`,
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
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });
    expect(mapLayers.citybike).to.equal(true);
  });

  it('should update the park&ride layer', () => {
    let mapLayers = {
      parkAndRide: false,
      stop: {},
      terminal: {},
    };
    const props = {
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        parkAndRide: {
          showParkAndRide: true,
        },
      },
    };
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );

    wrapper
      .find('.option-checkbox.large input')
      .at(0)
      .simulate('change', { target: { checked: true } });

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
      open: true,
      setOpen: () => {},
      lang: 'fi',
      mapLayers,
      updateMapLayers: layers => {
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
        CONFIG: 'default',
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
    const wrapper = mountWithIntl(
      <MapLayersDialogContent isOpen {...props} />,
      {
        context: { ...mockContext, ...context },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    const checkboxes = wrapper.find('.option-checkbox.large input');
    expect(checkboxes.length).to.equal(2);

    checkboxes.at(1).simulate('change', { target: { checked: true } });

    expect(mapLayers.geoJson.morejson).to.equal(true);
  });

  describe('getGeoJsonLayersOrDefault', () => {
    it('should return the layers from the configuration', () => {
      const config = {
        CONFIG: 'default',
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
        CONFIG: 'default',
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
      const config = { CONFIG: 'default' };
      const store = {};
      const defaultValue = [];
      expect(getGeoJsonLayersOrDefault(config, store, defaultValue)).to.equal(
        defaultValue,
      );
    });
  });
});
