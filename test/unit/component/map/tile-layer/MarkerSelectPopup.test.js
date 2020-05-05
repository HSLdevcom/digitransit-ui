import React from 'react';

import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';
import MarkerSelectPopup from '../../../../../app/component/map/tile-layer/MarkerSelectPopup';

describe('<MarkerSelectPopup />', () => {
  it('should use a unique key for each row when the rows include citybike stops', () => {
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
              networks: ['foobar'],
            },
          },
        },
      ],
      selectRow: () => {},
      location: {
        lat: 60.169525626502484,
        lng: 24.933235645294193,
      },
    };
    const wrapper = shallowWithIntl(<MarkerSelectPopup {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
