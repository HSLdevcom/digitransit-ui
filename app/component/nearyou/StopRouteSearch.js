import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { routerShape } from 'found';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { filterSearchResultsByMode } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { configShape } from '../../util/shapes';
import { withSearchContext } from '../WithSearchContext';
import { getStopRoutePath } from '../../util/path';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
const searchSources = ['Favourite', 'History', 'Datasource'];

function StopRouteSearch({ mode, ...rest }, { router, config }) {
  const transportMode = `route-${mode}`;

  const filter = config.stopSearchFilter
    ? (results, transportmode, type) =>
        filterSearchResultsByMode(results, transportmode, type).filter(
          config.stopSearchFilter,
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
      break;
    default:
      targets = ['Stops', 'Stations', 'Routes'];
      break;
  }
  return (
    <div className="stops-near-you-search-container">
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
        getAutoSuggestIcons={config.getAutoSuggestIcons}
        colors={config.colors}
        modeSet={config.iconModeSet}
        {...rest}
      />
    </div>
  );
}

StopRouteSearch.propTypes = { mode: PropTypes.string.isRequired };

StopRouteSearch.contextTypes = {
  router: routerShape.isRequired,
  config: configShape.isRequired,
};

export default memo(StopRouteSearch);
