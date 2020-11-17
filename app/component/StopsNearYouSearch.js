import PropTypes from 'prop-types';
import React from 'react';
import { pure } from 'recompose';
import compact from 'lodash/compact';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterStopsAndStationsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { getGTFSId } from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import withSearchContext from './WithSearchContext';

function StopsNearYouSearch({ mode, breakpoint }) {
  const filterSearchResultsByMode = (results, type) => {
    switch (type) {
      case 'Routes':
        return results;
      case 'Stops': {
        const gtfsIds = results.map(x => {
          const gtfsId = x.properties.gtfsId
            ? x.properties.gtfsId
            : getGTFSId({ id: x.properties.id });
          if (gtfsId) {
            return {
              gtfsId,
              ...x,
            };
          }
          return null;
        });
        return filterStopsAndStationsByMode(compact(gtfsIds), mode);
      }
      default:
        return results;
    }
  };
  const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
  const isMobile = breakpoint !== 'large';
  const transportMode = `route-${mode}`;
  const searchSources = ['Favourite', 'History', 'Datasource'];
  return (
    <div className="stops-near-you-search-container">
      <div className="search-container-first">
        <DTAutoSuggestWithSearchContext
          icon="search"
          id="stop-route-station"
          refPoint={origin}
          className="destination"
          placeholder={`stop-near-you-${mode.toLowerCase()}`}
          transportMode={transportMode}
          geocodingSize={40}
          value=""
          filterResults={filterSearchResultsByMode}
          sources={searchSources}
          targets={
            mode === 'CITYBIKE' ? ['BikeRentalStations'] : ['Stops', 'Routes']
          }
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

StopsNearYouSearch.propTypes = {
  mode: PropTypes.string.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

export default pure(StopsNearYouSearch);
