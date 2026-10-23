import React, { useEffect, useRef } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useRouter } from 'found';
import isEqual from 'lodash/isEqual';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { createUrl } from '@digitransit-store/digitransit-store-future-route';
import inside from 'point-in-polygon';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import FavouritesContainer from './FavouritesContainer';
import DatetimepickerContainer from './DatetimepickerContainer';
import {
  withSearchContext,
  getLocationSearchTargets,
} from './WithSearchContext';
import {
  getPathWithEndpointObjects,
  getStopRoutePath,
  parseLocation,
  sameLocations,
  definesItinerarySearch,
} from '../../utils/client/path';
import {
  PREFIX_NEARYOU,
  PREFIX_ITINERARY_SUMMARY,
} from '../../utils/shared/path';
import { addAnalyticsEvent } from '../../utils/client/analyticsUtils';
import { useBreakpoint } from '../hooks/withBreakpoint';
import useGeomoverSync from '../hooks/useGeomoverSync';
import scrollTop from '../../utils/client/scroll';
import { getRefPoint } from '../../utils/client/apiUtils';
import { filterObject } from '../../utils/client/filterUtils';
import {
  getTransportModes,
  getNearYouModes,
  hasCitybikes,
} from '../../utils/client/modeUtils';
import {
  countLocations,
  STATUS_FETCHING_OR_UPDATING,
} from '../data/FavouriteData';
import {
  useFavourites,
  useFavouriteStatus,
  useHasOtpLocationFavourites,
} from '../hooks/FavouriteContext';
import { useConfigContext } from '../client/ConfigContext';
import { usePosition, usePositionActions } from '../hooks/PositionContext';
import { useCurrentTime } from '../hooks/TimeContext';
import {
  useOrigin,
  useDestination,
  useItineraryLocationActions,
} from '../hooks/ItineraryLocationContext';
import TrafficNowLink from './trafficnow/TrafficNowLink';

const StopRouteSearch = withSearchContext(DTAutoSuggest);
const LocationSearch = withSearchContext(DTAutosuggestPanel);

export default function IndexPage() {
  const pendingOriginRef = useRef(null);
  const pendingDestinationRef = useRef(null);
  const intl = useIntl();
  const { match, router } = useRouter();
  const breakpoint = useBreakpoint();
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const locationState = usePosition();
  const { checkPositioningPermission, startLocationWatch } =
    usePositionActions();
  const origin = useOrigin();
  const destination = useDestination();
  const { setOrigin, setDestination } = useItineraryLocationActions();
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const hasOtpLocationFavourites = useHasOtpLocationFavourites();
  const { query } = match.location;
  const fromMap =
    query.fromMap === 'origin' || query.fromMap === 'destination'
      ? query.fromMap
      : undefined;
  const { colors, language, iconModeSet } = config;

  useGeomoverSync({ locationState, startLocationWatch });

  useEffect(() => {
    const { from, to } = match.params;

    const parsedOrigin = parseLocation(from);
    const parsedDestination = parseLocation(to);

    if (!sameLocations(origin, parsedOrigin)) {
      pendingOriginRef.current = parsedOrigin;
      setOrigin(parsedOrigin);
    }

    if (!sameLocations(destination, parsedDestination)) {
      pendingDestinationRef.current = parsedDestination;
      setDestination(parsedDestination);
    }

    if (config.startSearchFromUserLocation && !parsedOrigin.lat) {
      checkPositioningPermission().then(permission => {
        if (
          permission.state === 'granted' &&
          locationState.status === 'no-location'
        ) {
          startLocationWatch();
        }
      });
    }

    scrollTop();
  }, []);

  useEffect(() => {
    if (pendingOriginRef.current && isEqual(pendingOriginRef.current, origin)) {
      pendingOriginRef.current = null;
    }

    if (
      pendingDestinationRef.current &&
      isEqual(pendingDestinationRef.current, destination)
    ) {
      pendingDestinationRef.current = null;
    }

    if (pendingOriginRef.current || pendingDestinationRef.current) {
      // not ready for navigation yet
      return;
    }

    const { location } = match;

    // assign locationState conditionally, but never as a stand-in origin
    // when the destination is already the user's own current location
    const currentLocation =
      config.startSearchFromUserLocation &&
      !origin.address &&
      destination.type !== 'CurrentLocation' &&
      locationState?.hasLocation &&
      locationState;

    if (currentLocation && !currentLocation.isReverseGeocodingInProgress) {
      const originPoint = [currentLocation.lon, currentLocation.lat];
      if (inside(originPoint, config.areaPolygon)) {
        setOrigin(currentLocation);
      }
    }

    if (definesItinerarySearch(origin, destination)) {
      const newLocation = {
        ...location,
        pathname: getPathWithEndpointObjects(
          origin,
          destination,
          PREFIX_ITINERARY_SUMMARY,
        ),
      };

      if (newLocation.query.time === undefined) {
        newLocation.query.time = Math.floor(Date.now() / 1000).toString();
      }
      delete newLocation.query.setTime;
      delete newLocation.query.fromMap;
      router.push(newLocation);
    } else {
      const path = getPathWithEndpointObjects(
        origin,
        destination,
        config.indexPath,
      );

      if (path !== location.pathname || location.query.fromMap) {
        // also replace when only the fromMap param needs to be dropped
        const newLocation = {
          ...location,
          pathname: path,
          query: { ...location.query },
        };
        delete newLocation.query.fromMap;
        router.replace(newLocation);
      }
    }
  }, [origin, destination, locationState]);

  const onSelectStopRoute = item => {
    addAnalyticsEvent({
      event: 'route_search',
      search_action: 'route_or_stop',
    });
    router.push(getStopRoutePath(item));
  };

  // Removes the fromMap query parameter from the URL, if present.
  const onFromMapClose = () => {
    const { location } = match;
    if (location.query.fromMap === undefined) {
      return;
    }
    const nextQuery = { ...location.query };
    delete nextQuery.fromMap;
    router.replace({ ...location, query: nextQuery });
  };

  const onSelectLocation = (item, id) => {
    addAnalyticsEvent({
      event: 'itinerary_search',
      search_action: item.type,
    });

    if (item.type === 'FutureRoute') {
      router.push(
        createUrl(item, { itinerarySummaryPrefix: PREFIX_ITINERARY_SUMMARY }),
      );
    } else if (id === 'origin') {
      setOrigin(item);
    } else {
      setDestination(item);
    }
  };

  const clickFavourite = favourite => {
    addAnalyticsEvent({
      event: 'favorite_press',
      favorite_type: 'place',
    });
    setDestination(favourite);
  };

  const clickStopNearIcon = url => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'nearbyStops',
      stop_type: url.split('/')[2].toLowerCase(),
    });
    router.push(url);
  };

  const renderNearStops = () => {
    const nearYouModes = getNearYouModes(config, hasOtpLocationFavourites);
    // If nearYouModes is configured, display those. Otherwise, display all configured transport modes
    const modeArray =
      nearYouModes.length > 0
        ? nearYouModes
        : Object.keys(
            filterObject(
              getTransportModes(config),
              'availableForSelection',
              true,
            ),
          );

    const alertsContext = {
      currentTime,
      getModesWithAlerts,
      feedIds: config.feedIds,
    };

    const directionProps = config.narrowNearYouButtons
      ? {}
      : { horizontal: false };

    return config.showNearYouButtons ? (
      <CtrlPanel.NearStopsAndRoutes
        modeArray={modeArray}
        loading={favouriteStatus === STATUS_FETCHING_OR_UPDATING}
        modeSet={iconModeSet}
        urlPrefix={`/${PREFIX_NEARYOU}`}
        language={language}
        title={config.nearYouTitle}
        alertsContext={alertsContext}
        origin={origin}
        omitLanguageUrl
        onClick={clickStopNearIcon}
        colors={colors}
        {...directionProps}
      />
    ) : (
      <div className="stops-near-you-text">
        <h2>
          {intl.formatMessage({
            id: 'near-you-search',
            defaultMessage: 'Search stops and routes',
          })}
        </h2>
      </div>
    );
  };

  const visibleOrigin = pendingOriginRef.current || origin;
  const visibleDestination = pendingDestinationRef.current || destination;

  const locationSources = ['History', 'Datasource'];
  const sources = ['Favourite', 'History', 'Datasource'];
  const stopAndRouteSearchTargets = ['Stations', 'Stops', 'Routes'];
  const targets = getLocationSearchTargets(config, breakpoint !== 'large');

  targets.push('FutureRoutes');

  if (countLocations(favourites)) {
    locationSources.push('Favourite');
  }

  if (!config.targetsFromOTP) {
    if (hasCitybikes(config.vehicleRental?.networks, config)) {
      stopAndRouteSearchTargets.push('VehicleRentalStations');
    }
    if (config.includeParkAndRideSuggestions) {
      stopAndRouteSearchTargets.push('ParkingAreas');
    }
  }

  const showSpinner =
    (visibleOrigin.type === 'CurrentLocation' && !visibleOrigin.address) ||
    (visibleDestination.type === 'CurrentLocation' &&
      !visibleDestination.address);

  const refPoint = getRefPoint(
    visibleOrigin,
    visibleDestination,
    locationState,
  );

  const locationSearchProps = {
    appElement: '#app',
    origin: visibleOrigin,
    destination: visibleDestination,
    lang: language,
    sources: locationSources,
    targets,
    refPoint,
    searchPanelText: intl.formatMessage({
      id: 'where',
      defaultMessage: 'Where to?',
    }),
    originPlaceHolder: 'search-origin-index',
    destinationPlaceHolder: 'search-destination-index',
    selectHandler: onSelectLocation,
    getAutoSuggestIcons: config.getAutoSuggestIcons,
    onGeolocationStart: onSelectLocation,
    fromMap,
    onFromMapClose,
    colors,
    modeSet: iconModeSet,
  };

  const stopRouteSearchProps = {
    appElement: '#app',
    icon: 'search',
    id: 'stop-route-station',
    className: 'destination',
    placeholder: 'stop-near-you',
    selectHandler: onSelectStopRoute,
    getAutoSuggestIcons: config.getAutoSuggestIcons,
    value: '',
    lang: language,
    sources,
    targets: stopAndRouteSearchTargets,
    colors,
    modeSet: iconModeSet,
    geocodingSize: 25,
  };

  if (config.stopSearchFilter) {
    stopRouteSearchProps.filterResults = results =>
      results.filter(config.stopSearchFilter);
    // increase size to compensate filtering
    stopRouteSearchProps.geocodingSize = 40;
    locationSearchProps.filterResults = results =>
      results.filter(config.stopSearchFilter);
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return breakpoint === 'large' ? (
    <div
      className={`front-page flex-vertical ${
        showSpinner && `blurred`
      } fullscreen bp-${breakpoint}`}
    >
      <div
        style={{ display: 'block' }}
        className="scrollable-content-wrapper momentum-scroll"
      >
        <h1 className="sr-only">
          <FormattedMessage id="index.title" default="Journey Planner" />
        </h1>
        <CtrlPanel position="left">
          <span className="sr-only">
            <FormattedMessage
              id="search-fields.sr-instructions"
              defaultMessage="The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search"
            />
          </span>
          <LocationSearch {...locationSearchProps} />
          <DatetimepickerContainer realtime />
          {!config.hideFavourites && (
            <>
              <FavouritesContainer
                onClickFavourite={clickFavourite}
                lang={language}
              />
              <CtrlPanel.SeparatorLine usePaddingBottom20 />
            </>
          )}

          {!config.hideStopRouteSearch && (
            <>
              <>{renderNearStops()}</>
              <StopRouteSearch {...stopRouteSearchProps} />
              <CtrlPanel.SeparatorLine />
            </>
          )}

          <TrafficNowLink />
        </CtrlPanel>
      </div>
      {(showSpinner && <OverlayWithSpinner />) || null}
    </div>
  ) : (
    <div
      className={`front-page flex-vertical ${
        showSpinner && `blurred`
      } bp-${breakpoint}`}
    >
      {(showSpinner && <OverlayWithSpinner />) || null}
      <div
        style={{
          display: 'block',
          backgroundColor: '#ffffff',
        }}
      >
        <CtrlPanel position="bottom">
          <LocationSearch disableAutoFocus isMobile {...locationSearchProps} />
          <DatetimepickerContainer realtime />
          <FavouritesContainer
            onClickFavourite={clickFavourite}
            lang={language}
            isMobile
          />
          <CtrlPanel.SeparatorLine />
          <>{renderNearStops()}</>
          <div className="stop-route-search-container">
            <StopRouteSearch isMobile {...stopRouteSearchProps} />
          </div>
          <CtrlPanel.SeparatorLine usePaddingBottom20 />
          <TrafficNowLink />
        </CtrlPanel>
      </div>
    </div>
  );
}
