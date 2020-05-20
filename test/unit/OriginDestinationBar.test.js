import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';

import { mockMatch, mockRouter } from './helpers/mock-router';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import OriginDestinationBar from '../../app/component/OriginDestinationBar';
import DTAutosuggestContainer from '../../app/component/DTAutosuggestContainer';
import searchContext from '../../app/util/searchContext';
import { setIntermediatePlaces } from '../../app/util/queryUtils';

describe('<OriginDestinationBar />', () => {
  describe('swapEndpoints', () => {
    it('should also swap via points in the query', () => {
      const props = {
        searchContext,
        destination: {},
        origin: {},
      };

      let callParams;
      const router = {
        ...mockRouter,
        replace: params => {
          callParams = params;
        },
      };

      setIntermediatePlaces(router, mockMatch, [
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
        'Kamppi 1241, Helsinki::60.169119,24.932058',
      ]);

      const wrapper = mountWithIntl(<OriginDestinationBar {...props} />, {
        context: {
          ...mockContext,
          match: {
            ...mockMatch,
            location: {
              ...mockMatch.location,
              query: {
                ...callParams.query,
              },
            },
          },
          config: {
            autoSuggest: {
              locationAware: true,
            },
            URL: {
              PELIAS: 'foo.com',
            },
            search: {
              suggestions: {
                useTransportIcons: false,
              },
              usePeliasStops: false,
              mapPeliasModality: false,
              peliasMapping: {},
              peliasLayer: null,
              peliasLocalization: null,
              minimalRegexp: new RegExp('.{2,}'),
            },
          },
          getStore: () => ({
            getCurrentTime: () => moment(),
            getViaPoints: () => {},
            getLocationState: () => {
              return {
                lat: 0,
                lon: 0,
                status: 'no-location',
                hasLocation: false,
                isLocationingInProgress: false,
                locationingFailed: false,
              };
            },
            on: () => {},
          }),
          router,
        },
        childContextTypes: mockChildContextTypes,
      });

      wrapper.find(DTAutosuggestContainer).prop('swapOrder')();

      expect(callParams.query.intermediatePlaces).to.deep.equal([
        'Kamppi 1241, Helsinki::60.169119,24.932058',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ]);
    });
  });
});
