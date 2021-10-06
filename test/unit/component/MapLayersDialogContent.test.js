import { expect } from 'chai';
import { describe, it, xit } from 'mocha';
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
      setMapMode: () => {},
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
      setMapMode: () => {},
    };
    const context = {
      config: {
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
      .find('.option-checkbox input')
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
      setMapMode: () => {},
    };
    const context = {
      config: {
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
      .find('.option-checkbox input')
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
      setMapMode: () => {},
    };
    const context = {
      config: {
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
      .find('.option-checkbox input')
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
      setMapMode: () => {},
    };
    const context = {
      config: {
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
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.ferry).to.equal(true);
  });

  it('should update the citybike layer', () => {
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
      setMapMode: () => {},
    };
    const context = {
      config: {
        cityBike: {
          networks: {
            foo: {
              enabled: true,
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

    expect(mapLayers.citybike).to.equal(false);

    wrapper
      .find('.option-checkbox input')
      .at(2)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.citybike).to.equal(true);
  });

  xit('should update the park&ride layer', () => {
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
      setMapMode: () => {},
    };
    const context = {
      config: {
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
      .find('.option-checkbox input')
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
      setMapMode: () => {},
      geoJson: {
        somejson: {
          name: {
            fi: 'testi',
            sv: 'test',
            en: 'Public Toilets',
          },
        },
        morejson: {
          name: {
            fi: 'nimi',
            sv: 'namn',
            en: 'LoRaWAN Gateways',
          },
        },
      },
    };
    const context = {
      config: {
        geoJson: {
          layers: [
            {
              name: {
                fi: 'testi',
                sv: 'test',
                en: 'Public Toilets',
              },
              url: 'somejson',
            },
            {
              name: {
                fi: 'nimi',
                sv: 'namn',
                en: 'LoRaWAN Gateways',
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
    const checkboxes = wrapper.find('.option-checkbox input');

    checkboxes.at(4).simulate('change', { target: { checked: true } });

    expect(mapLayers.geoJson.morejson).to.equal(true);
  });

  describe('getGeoJsonLayersOrDefault', () => {
    it('should return the layers from the configuration', () => {
      const config = {
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
      const config = {};
      const store = {};
      const defaultValue = [];
      expect(getGeoJsonLayersOrDefault(config, store, defaultValue)).to.equal(
        defaultValue,
      );
    });
  });
});
