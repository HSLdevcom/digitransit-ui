import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import {
  Component as SelectMapLayersDialog,
  getGeoJsonLayersOrDefault,
} from '../../../app/component/SelectMapLayersDialog';

describe('<SelectMapLayersDialog />', () => {
  it('should render', () => {
    const props = {
      mapLayers: {
        stop: {},
        terminal: {},
        ticketSales: {},
      },
      updateMapLayers: () => {},
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find('.select-map-layers-dialog-content')).to.have.lengthOf(
      1,
    );
  });

  it('should update the vehicles layer', () => {
    let mapLayers = {
      showAllBusses: false,
      stop: {},
      terminal: {},
      ticketSales: {},
    };
    const props = {
      config: {
        showAllBusses: true,
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.showAllBusses).to.equal(true);
  });

  it('should update the bus stop layer', () => {
    let mapLayers = {
      stop: {
        bus: false,
      },
      terminal: {},
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.bus).to.equal(true);
  });

  it('should update the bus terminal layer', () => {
    let mapLayers = {
      stop: {},
      terminal: {
        bus: false,
      },
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(1)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.terminal.bus).to.equal(true);
  });

  it('should update the tram stop layer', () => {
    let mapLayers = {
      stop: {
        tram: false,
      },
      terminal: {},
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          tram: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.tram).to.equal(true);
  });

  it('should update the rail stop and terminal layers', () => {
    let mapLayers = {
      stop: {
        rail: false,
      },
      terminal: {
        rail: false,
      },
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          rail: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.rail).to.equal(true);
    expect(mapLayers.terminal.rail).to.equal(true);
  });

  it('should update the subway stop and terminal layers', () => {
    let mapLayers = {
      stop: {
        subway: false,
      },
      terminal: {
        subway: false,
      },
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          subway: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.stop.subway).to.equal(true);
    expect(mapLayers.terminal.subway).to.equal(true);
  });

  it('should update the ferry stop layer', () => {
    let mapLayers = {
      stop: {
        ferry: false,
      },
      terminal: {},
      ticketSales: {},
    };
    const props = {
      config: {
        transportModes: {
          ferry: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

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
      ticketSales: {},
    };
    const props = {
      config: {
        cityBike: {
          showCityBikes: true,
        },
        transportModes: {
          citybike: {
            availableForSelection: true,
          },
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.citybike).to.equal(true);
  });

  it('should update the park&ride layer', () => {
    let mapLayers = {
      parkAndRide: false,
      stop: {},
      terminal: {},
      ticketSales: {},
    };
    const props = {
      config: {
        parkAndRide: {
          showParkAndRide: true,
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });

    expect(mapLayers.parkAndRide).to.equal(true);
  });

  it('should update the ticket sales layers', () => {
    let mapLayers = {
      stop: {},
      terminal: {},
      ticketSales: {
        salesPoint: false,
        servicePoint: false,
        ticketMachine: false,
      },
    };
    const props = {
      config: {
        ticketSales: {
          showTicketSales: true,
        },
      },
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    wrapper
      .find('.option-checkbox input')
      .at(0)
      .simulate('change', { target: { checked: true } });
    expect(mapLayers.ticketSales.ticketMachine).to.equal(true);

    wrapper
      .find('.option-checkbox input')
      .at(1)
      .simulate('change', { target: { checked: true } });
    expect(mapLayers.ticketSales.salesPoint).to.equal(true);
    expect(mapLayers.ticketSales.servicePoint).to.equal(true);
  });

  it('should include geoJson layers', () => {
    let mapLayers = {
      terminal: {},
      ticketSales: {},
      stop: {},
      geoJson: {
        somejson: true,
        morejson: false,
      },
    };
    const props = {
      config: {
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
      mapLayers,
      updateMapLayers: layers => {
        mapLayers = { ...layers };
      },
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const checkboxes = wrapper.find('.option-checkbox input');
    expect(checkboxes.length).to.equal(2);

    checkboxes.at(1).simulate('change', { target: { checked: true } });

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
