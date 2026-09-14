import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { routerShape } from 'found';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterSearchResultsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { withSearchContext } from '../WithSearchContext';
import { getStopRoutePath } from '../../util/path';
import { useConfigContext } from '../../configurations/ConfigContext';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
const searchSources = ['Favourite', 'History', 'Datasource'];

function parkFilter(parks, mode) {
  return parks.filter(p => p.properties?.layer === mode.toLowerCase());
}

function StopRouteSearch({ mode, router, ...rest }) {
  const transportMode = `route-${mode}`;
  const {
    getAutoSuggestIcons,
    colors,
    iconModeSet,
    language,
    stopSearchFilter,
  } = useConfigContext();

  let filter = stopSearchFilter
    ? (results, transportmode, type) =>
        filterSearchResultsByMode(results, transportmode, type).filter(
          stopSearchFilter,
        )
    : filterSearchResultsByMode;
  const selectHandler = item => {
    router.push(getStopRoutePath(item));
  };

  let targets;
  switch (mode) {
    case 'CITYBIKE':
      targets = ['VehicleRentalStations'];
      break;
    case 'BIKEPARK':
    case 'CARPARK':
      targets = ['ParkingAreas'];
      filter = parkFilter;
      break;
    default:
      targets = ['Stops', 'Stations', 'Routes'];
      break;
  }
  return (
    <div className="near-you-search-container">
      <DTAutoSuggestWithSearchContext
        icon="search"
        id="stop-route-station"
        className="destination"
        placeholder={`stop-near-you-${mode.toLowerCase()}`}
        transportMode={transportMode}
        geocodingSize={40}
        value=""
        filterResults={filter}
        sources={searchSources}
        targets={targets}
        selectHandler={selectHandler} // prop for context handler
        getAutoSuggestIcons={getAutoSuggestIcons}
        colors={colors}
        modeSet={iconModeSet}
        lang={language}
        {...rest}
      />
    </div>
  );
}

StopRouteSearch.propTypes = {
  mode: PropTypes.string.isRequired,
  router: routerShape.isRequired,
};

export default memo(StopRouteSearch);
