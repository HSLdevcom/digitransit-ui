import PropTypes from 'prop-types';
import React from 'react';
import { LeafletProvider } from 'react-leaflet/es/context';

import { mountWithIntl } from '../../../helpers/mock-intl-enzyme';
import {
  mockChildContextTypes,
  mockContext,
} from '../../../helpers/mock-context';
import TileLayerContainer, {
  Component,
} from '../../../../../app/component/map/tile-layer/TileLayerContainer';

describe('<TileLayerContainer />', () => {
  it('should have an onClose handler defined for the popup', () => {
    const props = {
      tileSize: 512,
      zoomOffset: -1,
    };
    const wrapper = mountWithIntl(
      <LeafletProvider
        value={{
          map: {
            addEventParent: () => {},
            addLayer: () => {},
            on: () => {},
            openPopup: () => {},
            options: {
              maxZoom: 16,
              minZoom: 10,
            },
            removeEventParent: () => {},
          },
        }}
      >
        <TileLayerContainer {...props} />
      </LeafletProvider>,
      {
        context: {
          ...mockContext,
          getStore: () => ({
            addChangeListener: () => {},
            getCurrentTime: () => ({ unix: () => 123457890 }),
            getMapLayers: () => ({
              stop: {},
              terminal: {},
              ticketSales: {},
            }),
            on: () => {},
          }),
        },
        childContextTypes: {
          ...mockChildContextTypes,
          leaflet: PropTypes.func,
        },
      },
    );
    wrapper.find(Component).setState({
      selectableTargets: [
        {
          feature: {
            geom: { x: 1899, y: 2945 },
            layer: 'stop',
            properties: {
              code: '1409',
              gtfsId: 'HSL:1301214',
              name: 'Saunalahti',
              parentStation: 'null',
              patterns:
                '"[{"headsign":"Otaniemi","type":"BUS","shortName":"552"}]"',
              platform: 'null',
              type: 'BUS',
            },
          },
          coords: {
            lat: 60.192229421528765,
            lng: 24.87814038991928,
          },
          showSpinner: true,
        },
      ],
    });

    expect(
      wrapper
        .find('.popup')
        .at(0)
        .prop('onClose'),
    ).to.not.equal(undefined);
  });
});
