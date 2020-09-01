import PropTypes from 'prop-types';
import React from 'react';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterStopsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import withSearchContext from './WithSearchContext';
import { getGTFSId } from '../util/suggestionUtils';

function StopsNearYouSearch({ ...props }) {
  const filterSearchResultsFromOtp = results => {
    const gtfsIds = results.map(x => {
      return {
        gtfsId: getGTFSId({ id: x.properties.id }),
        ...x,
      };
    });
    const arr = filterStopsByMode(gtfsIds, props.mode);
    return arr;
  };
  const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
  const isMobile = props.breakpoint !== 'large';
  const layer = `route-${props.mode}`;
  return (
    <div className="stops-near-you-search-container">
      <div className="search-container-first">
        <DTAutoSuggestWithSearchContext
          icon="search"
          id="stop-route-station"
          refPoint={origin}
          className="destination"
          placeholder={`stop-near-you-${props.mode.toLowerCase()}`}
          layer={layer}
          value=""
          filter={filterSearchResultsFromOtp}
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

export default StopsNearYouSearch;
