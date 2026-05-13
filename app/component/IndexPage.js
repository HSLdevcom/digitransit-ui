import PropTypes from 'prop-types';
import React, { memo, useEffect, useRef } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useRouter } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEqual from 'lodash/isEqual';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import TrafficNowLink from '@digitransit-component/digitransit-component-traffic-now-link';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { createUrl } from '@digitransit-store/digitransit-store-future-route';
import inside from 'point-in-polygon';
import { locationShape } from '../util/shapes';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';
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
  PREFIX_NEARYOU,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withBreakpoint from '../util/withBreakpoint';
import Geomover from './Geomover';
import scrollTop from '../util/scroll';
import { getRefPoint } from '../util/apiUtils';
import { filterObject } from '../util/filterUtils';
import {
  getTransportModes,
  getNearYouModes,
  useCitybikes,
} from '../util/modeUtils';
import {
  checkPositioningPermission,
  startLocationWatch,
} from '../action/PositionActions';
import FavouriteStore from '../store/FavouriteStore';
import { useConfigContext } from '../configurations/ConfigContext';
import TrafficNowLinkNew from './trafficnow/TrafficNowLink';

const StopRouteSearch = withSearchContext(DTAutoSuggest);
const LocationSearch = withSearchContext(DTAutosuggestPanel);

function IndexPage(props, context) {
  const pendingOriginRef = useRef(null);
  const pendingDestinationRef = useRef(null);
  const intl = useIntl();
  const { match, router } = useRouter();
  const config = useConfigContext();
  const { colors, fontWeights, language, iconModeSet } = config;
  const { executeAction } = context;

  useEffect(() => {
    const { from, to } = match.params;

    const origin = parseLocation(from);
    const destination = parseLocation(to);

    if (!sameLocations(props.origin, origin)) {
      pendingOriginRef.current = origin;
      executeAction(storeOrigin, origin);
    }

    if (!sameLocations(props.destination, destination)) {
      pendingDestinationRef.current = destination;
      executeAction(storeDestination, destination);
    }

    if (config.startSearchFromUserLocation && !origin.lat) {
      checkPositioningPermission().then(permission => {
        if (
          permission.state === 'granted' &&
          props.locationState.status === 'no-location'
        ) {
          executeAction(startLocationWatch);
        }
      });
    }

    scrollTop();
  }, []);

  useEffect(() => {
    const { origin, destination, locationState } = props;

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

    // assign locationState conditionally
    const currentLocation =
      config.startSearchFromUserLocation &&
      !origin.address &&
      locationState?.hasLocation &&
      locationState;

    if (currentLocation && !currentLocation.isReverseGeocodingInProgress) {
      const originPoint = [currentLocation.lon, currentLocation.lat];
      if (inside(originPoint, config.areaPolygon)) {
        executeAction(storeOrigin, currentLocation);
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
      router.push(newLocation);
    } else {
      const path = getPathWithEndpointObjects(
        origin,
        destination,
        config.indexPath,
      );

      if (path !== location.pathname) {
        const newLocation = {
          ...location,
          pathname: path,
        };
        router.replace(newLocation);
      }
    }
  }, [props.origin, props.destination, props.locationState]);

  const onSelectStopRoute = item => {
    addAnalyticsEvent({
      event: 'route_search',
      search_action: 'route_or_stop',
    });
    router.push(getStopRoutePath(item));
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
      executeAction(storeOrigin, item);
    } else {
      executeAction(storeDestination, item);
    }
  };

  const clickFavourite = favourite => {
    addAnalyticsEvent({
      event: 'favorite_press',
      favorite_type: 'place',
    });
    executeAction(storeDestination, favourite);
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
    const nearYouModes = getNearYouModes(config, props.favourites);
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
      currentTime: props.currentTime,
      getModesWithAlerts,
      feedIds: config.feedIds,
    };

    const directionProps = config.narrowNearYouButtons
      ? {}
      : { horizontal: false };

    return config.showNearYouButtons ? (
      <CtrlPanel.NearStopsAndRoutes
        appElement="#app"
        modeArray={modeArray}
        loading={
          props.favouriteStatus === FavouriteStore.STATUS_FETCHING_OR_UPDATING
        }
        modeSet={iconModeSet}
        urlPrefix={`/${PREFIX_NEARYOU}`}
        language={language}
        title={config.nearYouTitle}
        alertsContext={alertsContext}
        origin={props.origin}
        omitLanguageUrl
        onClick={clickStopNearIcon}
        colors={colors}
        fontWeights={fontWeights}
        {...directionProps}
        isMobile={props.breakpoint !== 'large'}
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

  const { trafficNowLink, trafficNowTest } = config;
  const trafficNowHref = trafficNowLink
    ? `${config.URL.ROOTLINK}/${language === 'fi' ? '' : `${language}/`}${
        config.trafficNowLink[language]
      }`
    : undefined;
  const { breakpoint } = props;

  const origin = pendingOriginRef.current || props.origin;
  const destination = pendingDestinationRef.current || props.destination;

  const locationSources = ['History', 'Datasource'];
  const sources = ['Favourite', 'History', 'Datasource'];
  const stopAndRouteSearchTargets = ['Stations', 'Stops', 'Routes'];
  const targets = getLocationSearchTargets(config, breakpoint !== 'large');

  targets.push('FutureRoutes');

  if (context.getStore('FavouriteStore').getLocationCount()) {
    locationSources.push('Favourite');
  }

  if (!config.targetsFromOTP) {
    if (useCitybikes(config.vehicleRental?.networks, config)) {
      stopAndRouteSearchTargets.push('VehicleRentalStations');
    }
    if (config.includeParkAndRideSuggestions) {
      stopAndRouteSearchTargets.push('ParkingAreas');
    }
  }

  const showSpinner =
    (origin.type === 'CurrentLocation' && !origin.address) ||
    (destination.type === 'CurrentLocation' && !destination.address);

  const refPoint = getRefPoint(origin, destination, props.locationState);

  const locationSearchProps = {
    appElement: '#app',
    origin,
    destination,
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
    fromMap: props.fromMap,
    fontWeights,
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
    fontWeights,
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
        <CtrlPanel position="left" fontWeights={fontWeights}>
          <span className="sr-only">
            <FormattedMessage
              id="search-fields.sr-instructions"
              defaultMessage="The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search"
            />
          </span>
          <LocationSearch {...locationSearchProps} />
          <div className="datetimepicker-container">
            <DatetimepickerContainer
              realtime
              color={colors.primary}
              lang={language}
            />
          </div>
          {!config.hideFavourites && (
            <>
              <FavouritesContainer
                favouriteModalAction={props.favouriteModalAction}
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

          {trafficNowLink && !trafficNowTest && (
            <TrafficNowLink
              handleClick={(e, lang) => {
                window.location = `${config.URL.ROOTLINK}/${
                  lang === 'fi' ? '' : `${lang}/`
                }${config.trafficNowLink[lang]}`;
              }}
              href={trafficNowHref}
            />
          )}
          {trafficNowTest && <TrafficNowLinkNew />}
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
        <CtrlPanel position="bottom" fontWeights={fontWeights}>
          <LocationSearch disableAutoFocus isMobile {...locationSearchProps} />
          <div className="datetimepicker-container">
            <DatetimepickerContainer
              realtime
              color={colors.primary}
              lang={language}
            />
          </div>
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
          {trafficNowLink && !trafficNowTest && (
            <TrafficNowLink
              handleClick={(e, lang) => {
                window.location = `${config.URL.ROOTLINK}/${
                  lang === 'fi' ? '' : `${lang}/`
                }${config.trafficNowLink[lang]}`;
              }}
              href={trafficNowHref}
            />
          )}
          {trafficNowTest && <TrafficNowLinkNew />}
        </CtrlPanel>
      </div>
    </div>
  );
}

IndexPage.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

IndexPage.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  origin: locationShape.isRequired,
  destination: locationShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line
  favouriteModalAction: PropTypes.string,
  fromMap: PropTypes.string,
  locationState: locationShape.isRequired,
  favouriteStatus: PropTypes.string.isRequired,
  favourites: PropTypes.array.isRequired, // eslint-disable-line
};

IndexPage.defaultProps = {
  favouriteModalAction: '',
  fromMap: undefined,
};

// update only when origin/destination/breakpoint, favourite store status or language changes
const Index = memo(
  IndexPage,
  (props, nextProps) =>
    isEqual(nextProps.origin, props.origin) &&
    isEqual(nextProps.destination, props.destination) &&
    isEqual(nextProps.breakpoint, props.breakpoint) &&
    isEqual(nextProps.query, props.query) &&
    isEqual(nextProps.locationState, props.locationState) &&
    isEqual(nextProps.favouriteStatus, props.favouriteStatus),
);

const IndexPageWithBreakpoint = withBreakpoint(Index);

const IndexPageWithStores = connectToStores(
  IndexPageWithBreakpoint,
  [
    'OriginStore',
    'DestinationStore',
    'TimeStore',
    'PositionStore',
    'FavouriteStore',
  ],
  (context, props) => {
    const origin = context.getStore('OriginStore').getOrigin();
    const destination = context.getStore('DestinationStore').getDestination();
    const locationState = context.getStore('PositionStore').getLocationState();
    const { query } = props.match.location;
    const { favouriteModalAction, fromMap } = query;

    const newProps = {};
    newProps.locationState = locationState;
    if (favouriteModalAction) {
      newProps.favouriteModalAction = favouriteModalAction;
    }
    if (fromMap === 'origin' || fromMap === 'destination') {
      newProps.fromMap = fromMap;
    }
    newProps.origin = origin;
    newProps.destination = destination;
    newProps.currentTime = context.getStore('TimeStore').getCurrentTime();
    newProps.favouriteStatus = context.getStore('FavouriteStore').getStatus();
    newProps.favourites = context.getStore('FavouriteStore').getFavourites();
    // define itinerary search time & arriveBy
    newProps.query = query;

    return newProps;
  },
);

IndexPageWithStores.contextTypes = {
  ...IndexPageWithStores.contextTypes,
  executeAction: PropTypes.func.isRequired,
};

const GeoIndexPage = Geomover(IndexPageWithStores);

export { GeoIndexPage as default, IndexPageWithBreakpoint as Component };
