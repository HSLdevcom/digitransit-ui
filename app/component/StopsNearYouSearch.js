import PropTypes from 'prop-types';
import React from 'react';
import { pure } from 'recompose';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterSearchResultsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import withSearchContext from './WithSearchContext';
// import { getStopRoutePath } from '../util/path';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

function StopsNearYouSearch({ mode, breakpoint, lang }) {
  const isMobile = breakpoint !== 'large';
  const transportMode = `route-${mode}`;
  const searchSources = ['Favourite', 'History', 'Datasource'];
  return (
    <div className="stops-near-you-search-container">
      <div className="search-container-first">
        <DTAutoSuggestWithSearchContext
          icon="search"
          id="stop-route-station"
          lang={lang}
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
  lang: PropTypes.string.isRequired,
};

export default pure(StopsNearYouSearch);
