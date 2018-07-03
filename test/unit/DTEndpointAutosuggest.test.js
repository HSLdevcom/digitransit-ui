import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import mockRouter from './helpers/mock-router';
import { DTEndpointAutosuggestComponent } from '../../app/component/DTEndpointAutosuggest';

describe('<DTEndpointAutosuggest />', () => {
  describe('onSuggestionSelected', () => {
    it('should invoke onLocationSelected for a mapped via-point', () => {
      let wasCalled = false;
      const props = {
        id: 'viapoint',
        locationState: {
          lat: 0,
          lon: 0,
          status: 'no-location',
          hasLocation: false,
          isLocationingInProgress: false,
          locationingFailed: false,
        },
        onLocationSelected: () => {
          wasCalled = true;
        },
        placeholder: 'via-point',
        refPoint: {
          lat: 60.199118,
          lon: 24.940652,
          address: 'Opastinsilta 6, Helsinki',
          set: true,
          ready: true,
        },
        searchType: 'endpoint',
        value: ' ',
      };
      const wrapper = shallowWithIntl(
        <DTEndpointAutosuggestComponent {...props} />,
        {
          context: {
            executeAction: () => {},
            router: mockRouter,
          },
        },
      );

      const selectedItem = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [24.940652, 60.199118] },
        properties: {
          id: 'node:5561515626',
          gid: 'openstreetmap:address:node:5561515626',
          layer: 'address',
          source: 'openstreetmap',
          source_id: 'node:5561515626',
          name: 'Opastinsilta 6',
          housenumber: '6',
          street: 'Opastinsilta',
          postalcode: '00520',
          postalcode_gid: 'whosonfirst:postalcode:421473063',
          confidence: 1,
          distance: 196.673,
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
          neighbourhood: 'Itä-Pasila',
          neighbourhood_gid: 'whosonfirst:neighbourhood:85907977',
          label: 'Opastinsilta 6, Helsinki',
        },
      };
      wrapper.instance().onSuggestionSelected(selectedItem);

      expect(wasCalled).to.equal(true);
    });

    it('should invoke executeAction for a non-mapped via point (i.e. currentLocation)', () => {
      const props = {
        id: 'viapoint',
        locationState: {
          lat: 0,
          lon: 0,
          status: 'no-location',
          hasLocation: false,
          isLocationingInProgress: false,
          locationingFailed: false,
        },
        onLocationSelected: () => {},
        placeholder: 'via-point',
        refPoint: {
          lat: 60.199118,
          lon: 24.940652,
          address: 'Opastinsilta 6, Helsinki',
          set: true,
          ready: true,
        },
        searchType: 'endpoint',
        value: ' ',
      };

      let wasCalled = false;
      const wrapper = shallowWithIntl(
        <DTEndpointAutosuggestComponent {...props} />,
        {
          context: {
            executeAction: () => {
              wasCalled = true;
            },
            router: mockRouter,
          },
        },
      );

      const selectedItem = {
        type: 'CurrentLocation',
        lat: 0,
        lon: 0,
        properties: {
          labelId: 'Käytä nykyistä sijaintia',
          layer: 'currentPosition',
          lat: 0,
          lon: 0,
        },
      };
      wrapper.instance().onSuggestionSelected(selectedItem);

      expect(wasCalled).to.equal(true);
    });
  });
});
