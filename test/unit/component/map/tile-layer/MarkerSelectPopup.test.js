import React from 'react';

import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';
import MarkerSelectPopup from '../../../../../app/component/map/tile-layer/MarkerSelectPopup';
import SelectStopRow from '../../../../../app/component/map/tile-layer/SelectStopRow';
import SelectCityBikeRow from '../../../../../app/component/map/tile-layer/SelectCityBikeRow';
import SelectParkAndRideRow from '../../../../../app/component/map/tile-layer/SelectParkAndRideRow';
import SelectVehicleContainer from '../../../../../app/component/map/tile-layer/SelectVehicleContainer';
import { mockMatch } from '../../../helpers/mock-router';

describe('<MarkerSelectPopup />', () => {
  it('should render stop, citybike, parkandride and vehicle rows with valid data', () => {
    const props = {
      options: [
        {
          layer: 'stop',
          feature: {
            geom: { x: 2931, y: 3470 },
            properties: {
              gtfsId: 'HSL:1173127',
              name: 'Teollisuuskatu',
              code: '2105',
              platform: '23',
              parentStation: 'null',
              type: 'BUS',
              patterns:
                '[{"headsign":"Porvoo","type":"BUS","shortName":"848"},{"headsign":"Ilmala","type":"BUS","shortName":"23N"},{"headsign":"Jakomäki","type":"BUS","shortName":"69"},{"headsign":"Ruskeasuo","type":"BUS","shortName":"23"}]',
            },
          },
        },
        {
          layer: 'citybike',
          feature: {
            geom: { x: 2948, y: 3452 },
            properties: {
              id: '114',
              name: 'Ratapihantie',
              network: 'foobar',
            },
          },
        },
        {
          layer: 'parkAndRide',
          feature: {
            geom: {
              x: 3270,
              y: 2778,
            },
            properties: {
              name:
                '{"fi":"Tapiola Park","sv":"Tapiola Park","en":"Tapiola Park"}',
              id: 'liipi:990',
              carPlaces: true,
            },
          },
        },
        {
          layer: 'parkAndRideForBikes',
          feature: {
            geom: {
              x: 3270,
              y: 2778,
            },
            properties: {
              name:
                '{"fi":"Tapiola Bicycle Park","sv":"Tapiola Bicycle Park","en":"Tapiola Bicycle Park"}',
              id: 'liipi:995',
              bicyclePlaces: true,
            },
          },
        },
        {
          layer: 'realTimeVehicle',
          feature: {
            geom: { x: 2949.5, y: 3451.5 },
            properties: {},
            vehicle: {
              direction: 1,
              heading: 36,
              headsign: undefined,
              id: 'HSL_01317',
              lat: 60.17874,
              long: 24.82601,
              mode: 'bus',
              next_stop: 'HSL:2222234',
              operatingDay: '2021-01-18',
              route: 'HSL:2550',
              shortName: '550',
              timestamp: 1610977447,
              tripStartTime: '1530',
            },
          },
        },
      ],
      selectRow: () => {},
      location: {
        lat: 60.169525626502484,
        lng: 24.933235645294193,
      },
      colors: {
        primary: '#007ac9',
        hover: '#0062a1',
      },
    };
    const wrapper = shallowWithIntl(<MarkerSelectPopup {...props} />, {
      context: {
        match: mockMatch,
      },
    });
    expect(wrapper.find(SelectStopRow)).to.have.lengthOf(1);
    expect(wrapper.find(SelectCityBikeRow)).to.have.lengthOf(1);
    expect(wrapper.find(SelectParkAndRideRow)).to.have.lengthOf(2);
    expect(wrapper.find(SelectVehicleContainer)).to.have.lengthOf(1);
  });
});
