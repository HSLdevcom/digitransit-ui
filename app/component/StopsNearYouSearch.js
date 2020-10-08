import PropTypes from 'prop-types';
import React from 'react';
import { pure } from 'recompose';
import compact from 'lodash/compact';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterStopsAndStationsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import withSearchContext from './WithSearchContext';
import { getGTFSId } from '../util/suggestionUtils';

function StopsNearYouSearch({ ...props }) {
  const filterSearchResultsByMode = (results, type) => {
    switch (type) {
      case 'Routes':
        return results;
      case 'Stops': {
        const gtfsIds = results.map(x => {
          const gtfsId = getGTFSId({ id: x.properties.id });
          if (gtfsId) {
            return {
              gtfsId,
              ...x,
            };
          }
          return null;
        });
        return filterStopsAndStationsByMode(compact(gtfsIds), props.mode);
      }
      default:
        return results;
    }
  };
  const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
  const isMobile = props.breakpoint !== 'large';
  const transportMode = `route-${props.mode}`;
  return (
    <div className="stops-near-you-search-container">
      <div className="search-container-first">
        <DTAutoSuggestWithSearchContext
          icon="search"
          id="stop-route-station"
          refPoint={origin}
          className="destination"
          placeholder={`stop-near-you-${props.mode.toLowerCase()}`}
          transportMode={transportMode}
          geocodingSize={40}
          value=""
          filterResults={filterSearchResultsByMode}
          sources={['Favourite', 'History', 'Datasource']}
          targets={['Stops', 'Routes']}
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
