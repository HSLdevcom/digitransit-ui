import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import fetchMock from 'fetch-mock';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import DTOldSearchSavingAutosuggest from '../../app/component/DTOldSearchSavingAutosuggest';

const oldSearch = {
  type: 'OldSearch',
  // has bad coordinates
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: {
    id: 'node:301360127',
    gid: 'openstreetmap_address_node_301360127',
    layer: 'address',
    source: 'openstreetmap',
    source_id: 'node:301360127',
    name: 'Lapinlahdenkatu 1a',
    housenumber: '1a',
    street: 'Lapinlahdenkatu',
    postalcode: '00180',
    postalcode_gid: 'whosonfirst:postalcode:421473001',
    confidence: 0.9916400595568646,
    accuracy: 'point',
    country: 'Suomi',
    country_gid: 'whosonfirst:country:85633143',
    country_a: 'FIN',
    region: 'Uusimaa',
    region_gid: 'whosonfirst:region:85683067',
    localadmin: 'Helsinki',
    localadmin_gid: 'whosonfirst:localadmin:907199715',
    locality: 'Helsinki',
    locality_gid: 'whosonfirst:locality:101748417',
    neighbourhood: 'Kamppi',
    neighbourhood_gid: 'whosonfirst:neighbourhood:85898845',
    label: 'Lapinlahdenkatu 1a, Helsinki',
  },
};

const placeData = {
  features: [
    {
      type: 'Feature',
      // Give proper coords
      geometry: { type: 'Point', coordinates: [24.932251, 60.166408] },
      properties: {
        ...oldSearch.properties,
        // set a new name. We don't want it to update because selection would no longer match the user input
        name: 'foobar',
      },
    },
  ],
};

const geocodingURL = '/mock_api_url/geocoding/v1';

describe('<DTOldSearchSavingAutosuggest />', () => {
  beforeEach(() => {
    const url = `${geocodingURL}/place?ids=${oldSearch.properties.gid}`;
    fetchMock.get(url, placeData);
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should refresh coordinates of old searches, but not the name', () => {
    const props = {
      id: 'start',
      layers: [],
      onSelect: item => {
        const [lon, lat] = item.geometry.coordinates;
        expect(item.properties.name).to.equal('Lapinlahdenkatu 1a'); // did not change
        expect(lon).to.equal(placeData.features[0].geometry.coordinates[0]);
        expect(lat).to.equal(placeData.features[0].geometry.coordinates[1]);
      },
      searchType: 'endpoint',
      refPoint: {
        lat: 60.199118,
        lon: 24.940652,
        address: 'Opastinsilta 6, Helsinki',
        set: true,
        ready: true,
      },
      value: ' ',
    };
    const wrapper = shallowWithIntl(
      <DTOldSearchSavingAutosuggest {...props} />,
      {
        context: {
          executeAction: () => {},
          config: {
            URL: {
              GEOCODING_BASE_URL: geocodingURL,
            },
          },
        },
      },
    );
    wrapper.instance().onSelect(oldSearch);
  });
});
