import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { useRouter } from 'found';
import { locationStateShape, locationShape } from '../../util/shapes';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import {
  withSearchContext,
  getLocationSearchTargets,
} from '../WithSearchContext';
import {
  setIntermediatePlaces,
  updateItinerarySearch,
  onLocationPopup,
} from '../../util/queryUtils';
import { getIntermediatePlaces, locationToOTP } from '../../util/otpStrings';
import { setViaPoints } from '../../action/ViaPointActions';
import { getRefPoint } from '../../util/apiUtils';
import { useConfigContext } from '../../configurations/ConfigContext';

const DTAutosuggestPanelWithSearchContext =
  withSearchContext(DTAutosuggestPanel);

function OriginDestinationBar(
  {
    origin,
    destination,
    isMobile = false,
    showFavourites,
    viaPoints = [],
    locationState,
  },
  context,
) {
  const config = useConfigContext();
  const { match, router } = useRouter();
  const mountedRef = useRef(false);

  useEffect(() => {
    const initialViaPoints = getIntermediatePlaces(match.location.query);
    context.executeAction(setViaPoints, initialViaPoints);
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
    context.executeAction(setViaPoints, points);
    setIntermediatePlaces(router, match, points.map(locationToOTP));
  };

  const swapEndpoints = () => {
    const { location } = match;
    const intermediatePlaces = getIntermediatePlaces(location.query);

    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }

    updateItinerarySearch(
      destination,
      origin,
      router,
      location,
      context.executeAction,
    );
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
      onLocationPopup(item, id, router, match, context.executeAction);
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
  showFavourites: PropTypes.bool.isRequired,
  viaPoints: PropTypes.arrayOf(locationShape),
  locationState: locationStateShape.isRequired,
};

OriginDestinationBar.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func,
};

const connectedComponent = connectToStores(
  OriginDestinationBar,
  ['FavouriteStore', 'ViaPointStore', 'PositionStore'],
  ({ getStore }) => ({
    showFavourites: getStore('FavouriteStore').getLocationCount() > 0,
    viaPoints: getStore('ViaPointStore').getViaPoints(),
    locationState: getStore('PositionStore').getLocationState(),
  }),
);

export { connectedComponent as default, OriginDestinationBar as Component };
