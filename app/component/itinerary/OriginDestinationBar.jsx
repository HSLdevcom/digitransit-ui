import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { useRouter } from 'found';
import {
  locationStateShape,
  locationShape,
} from '../../../utils/client/shapes';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
import {
  withSearchContext,
  getLocationSearchTargets,
} from '../WithSearchContext';
import {
  setIntermediatePlaces,
  updateItinerarySearch,
  onLocationPopup,
} from '../../../utils/client/queryUtils';
import {
  getIntermediatePlaces,
  locationToOTP,
} from '../../../utils/shared/otpStrings';
import { getRefPoint } from '../../../utils/client/apiUtils';
import { useConfigContext } from '../../client/ConfigContext';
import { useFavourites } from '../../hooks/FavouriteContext';
import { countLocations } from '../../data/FavouriteData';
import {
  useViaPoints,
  useItineraryLocationActions,
} from '../../hooks/ItineraryLocationContext';

const DTAutosuggestPanelWithSearchContext =
  withSearchContext(DTAutosuggestPanel);

function OriginDestinationBar({
  origin,
  destination,
  isMobile = false,
  locationState,
}) {
  const config = useConfigContext();
  const { match, router } = useRouter();
  const mountedRef = useRef(false);
  const favourites = useFavourites();
  const showFavourites = countLocations(favourites) > 0;
  const viaPoints = useViaPoints();
  const viaPointActions = useItineraryLocationActions();
  const { setViaPoints } = viaPointActions;

  useEffect(() => {
    const initialViaPoints = getIntermediatePlaces(match.location.query);
    setViaPoints(initialViaPoints);
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, [match.location.query, router]);

  const updateViaPoints = newViaPoints => {
    // DTPanel can call this before the component has fully mounted.
    if (!mountedRef.current) {
      return;
    }

    const points = newViaPoints.filter(vp => vp.lat && vp.address);
    setViaPoints(points);
    setIntermediatePlaces(router, match, points.map(locationToOTP));
  };

  const swapEndpoints = () => {
    const { location } = match;
    const intermediatePlaces = getIntermediatePlaces(location.query);

    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }

    updateItinerarySearch(destination, origin, router, location);
  };

  const onLocationSelect = (item, id) => {
    let action;

    if (id === parseInt(id, 10)) {
      // id = via point index
      action = 'EditJourneyViaPoint';
      const points = [...viaPoints];
      points[id] = { ...item };
      updateViaPoints(points);
    } else {
      action =
        id === 'origin' ? 'EditJourneyStartPoint' : 'EditJourneyEndPoint';
      onLocationPopup(item, id, router, match, viaPointActions);
    }

    addAnalyticsEvent({
      action,
      category: 'ItinerarySettings',
      name: item.type,
    });
  };

  const refPoint = getRefPoint(origin, destination, locationState);

  const filter = config.stopSearchFilter
    ? results => results.filter(config.stopSearchFilter)
    : undefined;

  return (
    <div
      className={cx('origin-destination-bar', 'flex-horizontal', {
        'bp-large': !isMobile,
      })}
    >
      <DTAutosuggestPanelWithSearchContext
        appElement="#app"
        origin={origin}
        destination={destination}
        refPoint={refPoint}
        originPlaceHolder="search-origin-index"
        destinationPlaceHolder="search-destination-index"
        viaPoints={viaPoints}
        updateViaPoints={updateViaPoints}
        addAnalyticsEvent={addAnalyticsEvent}
        swapOrder={swapEndpoints}
        selectHandler={onLocationSelect}
        sources={['History', 'Datasource', showFavourites ? 'Favourite' : '']}
        targets={getLocationSearchTargets(config, isMobile)}
        lang={config.language}
        disableAutoFocus={isMobile}
        isMobile={isMobile}
        itineraryParams={match.location.query}
        colors={config.colors}
        modeSet={config.iconModeSet}
        onFocusChange={() => {}}
        showSwapControl
        showViapointControl={config.viaPointsEnabled}
        filterResults={filter}
      />
    </div>
  );
}

OriginDestinationBar.propTypes = {
  origin: locationShape.isRequired,
  destination: locationShape.isRequired,
  isMobile: PropTypes.bool,
  locationState: locationStateShape.isRequired,
};

const connectedComponent = connectToStores(
  OriginDestinationBar,
  ['PositionStore'],
  ({ getStore }) => ({
    locationState: getStore('PositionStore').getLocationState(),
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };
