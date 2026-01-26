import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEqual from 'lodash/isEqual';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import TrafficNowLink from '@digitransit-component/digitransit-component-traffic-now-link';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { createUrl } from '@digitransit-store/digitransit-store-future-route';
import inside from 'point-in-polygon';
import { configShape, locationShape } from '../util/shapes';
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

const StopRouteSearch = withSearchContext(DTAutoSuggest);
const LocationSearch = withSearchContext(DTAutosuggestPanel);

class IndexPage extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: configShape.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    origin: locationShape.isRequired,
    destination: locationShape.isRequired,
    lang: PropTypes.string,
    currentTime: PropTypes.number.isRequired,
    // eslint-disable-next-line
    query: PropTypes.object.isRequired,
    favouriteModalAction: PropTypes.string,
    fromMap: PropTypes.string,
    locationState: locationShape.isRequired,
  };

  static defaultProps = {
    lang: 'fi',
    favouriteModalAction: '',
    fromMap: undefined,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    const { from, to } = this.context.match.params;
    /* initialize stores from URL params */
    const origin = parseLocation(from);
    const destination = parseLocation(to);

    // synchronizing page init using fluxible is - hard -
    // see navigation conditions in componentDidUpdate below
    if (!sameLocations(this.props.origin, origin)) {
      this.pendingOrigin = origin;
      this.context.executeAction(storeOrigin, origin);
    }
    if (!sameLocations(this.props.destination, destination)) {
      this.pendingDestination = destination;
      this.context.executeAction(storeDestination, destination);
    }

    if (this.context.config.startSearchFromUserLocation && !origin.lat) {
      checkPositioningPermission().then(permission => {
        if (
          permission.state === 'granted' &&
          this.props.locationState.status === 'no-location'
        ) {
          this.context.executeAction(startLocationWatch);
        }
      });
    }
    scrollTop();
  }

  componentDidUpdate() {
    const { origin, destination } = this.props;

    if (this.pendingOrigin && isEqual(this.pendingOrigin, origin)) {
      delete this.pendingOrigin;
    }
    if (
      this.pendingDestination &&
      isEqual(this.pendingDestination, destination)
    ) {
      delete this.pendingDestination;
    }
    if (this.pendingOrigin || this.pendingDestination) {
      // not ready for navigation yet
      return;
    }

    const { router, match, config } = this.context;
    const { location } = match;

    const currentLocation =
      config.startSearchFromUserLocation &&
      !this.props.origin.address &&
      this.props.locationState?.hasLocation &&
      this.props.locationState;
    if (currentLocation && !currentLocation.isReverseGeocodingInProgress) {
      const originPoint = [currentLocation.lon, currentLocation.lat];
      if (inside(originPoint, config.areaPolygon)) {
        this.context.executeAction(storeOrigin, currentLocation);
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
  }

  onSelectStopRoute = item => {
    addAnalyticsEvent({
      event: 'route_search',
      search_action: 'route_or_stop',
    });
    this.context.router.push(getStopRoutePath(item));
  };

  onSelectLocation = (item, id) => {
    const { router, executeAction } = this.context;
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

  clickFavourite = favourite => {
    addAnalyticsEvent({
      event: 'favorite_press',
      favorite_type: 'place',
    });
    this.context.executeAction(storeDestination, favourite);
  };

  trafficNowHandler = (e, lang) => {
    window.location = `${this.context.config.URL.ROOTLINK}/${
      lang === 'fi' ? '' : `${lang}/`
    }${this.context.config.trafficNowLink[lang]}`;
  };

  clickStopNearIcon = url => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'nearbyStops',
      stop_type: url.split('/')[2].toLowerCase(),
    });
    this.context.router.push(url);
  };

  NearStops() {
    const { intl, config } = this.context;
    const { colors, fontWeights } = config;
    const { lang } = this.props;
    const nearYouModes = getNearYouModes(config);
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
      currentTime: this.props.currentTime,
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
        modeSet={config.iconModeSet}
        urlPrefix={`/${PREFIX_NEARYOU}`}
        language={lang}
        title={config.nearYouTitle}
        alertsContext={alertsContext}
        origin={this.props.origin}
        omitLanguageUrl
        onClick={this.clickStopNearIcon}
        colors={colors}
        fontWeights={fontWeights}
        {...directionProps}
        isMobile={this.props.breakpoint !== 'large'}
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
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { intl, config } = this.context;
    const { trafficNowLink, colors, fontWeights } = config;
    const { breakpoint, lang } = this.props;
    const origin = this.pendingOrigin || this.props.origin;
    const destination = this.pendingDestination || this.props.destination;
    const locationSources = ['History', 'Datasource'];
    const sources = ['Favourite', 'History', 'Datasource'];
    const stopAndRouteSearchTargets = ['Stations', 'Stops', 'Routes'];
    const targets = getLocationSearchTargets(config, breakpoint !== 'large');

    targets.push('FutureRoutes');
    if (this.context.getStore('FavouriteStore').getLocationCount()) {
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
    const refPoint = getRefPoint(origin, destination, this.props.locationState);
    const locationSearchProps = {
      appElement: '#app',
      origin,
      destination,
      lang,
      locationSources,
      targets,
      refPoint,
      searchPanelText: intl.formatMessage({
        id: 'where',
        defaultMessage: 'Where to?',
      }),
      originPlaceHolder: 'search-origin-index',
      destinationPlaceHolder: 'search-destination-index',
      selectHandler: this.onSelectLocation,
      getAutoSuggestIcons: config.getAutoSuggestIcons,
      onGeolocationStart: this.onSelectLocation,
      fromMap: this.props.fromMap,
      fontWeights,
      colors,
      modeSet: config.iconModeSet,
    };

    const stopRouteSearchProps = {
      appElement: '#app',
      icon: 'search',
      id: 'stop-route-station',
      className: 'destination',
      placeholder: 'stop-near-you',
      selectHandler: this.onSelectStopRoute,
      getAutoSuggestIcons: config.getAutoSuggestIcons,
      value: '',
      lang,
      sources,
      targets: stopAndRouteSearchTargets,
      fontWeights,
      colors,
      modeSet: config.iconModeSet,
      geocodingSize: 25,
    };

    if (config.stopSearchFilter) {
      stopRouteSearchProps.filterResults = results =>
        results.filter(config.stopSearchFilter);
      stopRouteSearchProps.geocodingSize = 40; // increase size to compensate filtering
      locationSearchProps.filterResults = results =>
        results.filter(config.stopSearchFilter);
    }

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
                lang={lang}
              />
            </div>
            {!config.hideFavourites && (
              <>
                <FavouritesContainer
                  favouriteModalAction={this.props.favouriteModalAction}
                  onClickFavourite={this.clickFavourite}
                  lang={lang}
                />
                <CtrlPanel.SeparatorLine usePaddingBottom20 />
              </>
            )}

            {!config.hideStopRouteSearch && (
              <>
                <>{this.NearStops()}</>
                <StopRouteSearch {...stopRouteSearchProps} />
                <CtrlPanel.SeparatorLine />
              </>
            )}
            {trafficNowLink?.[lang] && (
              <TrafficNowLink
                lang={lang}
                handleClick={this.trafficNowHandler}
              />
            )}
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
            <LocationSearch
              disableAutoFocus
              isMobile
              {...locationSearchProps}
            />
            <div className="datetimepicker-container">
              <DatetimepickerContainer
                realtime
                color={colors.primary}
                lang={lang}
              />
            </div>
            <FavouritesContainer
              onClickFavourite={this.clickFavourite}
              lang={lang}
              isMobile
            />
            <CtrlPanel.SeparatorLine />
            <>{this.NearStops()}</>
            <div className="stop-route-search-container">
              <StopRouteSearch isMobile {...stopRouteSearchProps} />
            </div>
            <CtrlPanel.SeparatorLine usePaddingBottom20 />
            {!trafficNowLink ||
              (trafficNowLink[lang] !== '' && (
                <TrafficNowLink
                  lang={lang}
                  handleClick={this.trafficNowHandler}
                  fontWeights={fontWeights}
                />
              ))}
          </CtrlPanel>
        </div>
      </div>
    );
  }
}

// update only when origin/destination/breakpoint, favourite store status or language changes
const Index = memo(
  IndexPage,
  (props, nextProps) =>
    isEqual(nextProps.origin, props.origin) &&
    isEqual(nextProps.destination, props.destination) &&
    isEqual(nextProps.breakpoint, props.breakpoint) &&
    isEqual(nextProps.lang, props.lang) &&
    isEqual(nextProps.query, props.query) &&
    isEqual(nextProps.locationState, props.locationState),
);

const IndexPageWithBreakpoint = withBreakpoint(Index);

const IndexPageWithStores = connectToStores(
  IndexPageWithBreakpoint,
  [
    'OriginStore',
    'DestinationStore',
    'TimeStore',
    'PreferencesStore',
    'PositionStore',
  ],
  (context, props) => {
    const origin = context.getStore('OriginStore').getOrigin();
    const destination = context.getStore('DestinationStore').getDestination();
    const locationState = context.getStore('PositionStore').getLocationState();
    const { location } = props.match;
    const newProps = {};
    const { query } = location;
    const { favouriteModalAction, fromMap } = query;
    newProps.locationState = locationState;

    if (favouriteModalAction) {
      newProps.favouriteModalAction = favouriteModalAction;
    }
    if (fromMap === 'origin' || fromMap === 'destination') {
      newProps.fromMap = fromMap;
    }
    newProps.origin = origin;
    newProps.destination = destination;
    newProps.lang = context.getStore('PreferencesStore').getLanguage();
    newProps.currentTime = context.getStore('TimeStore').getCurrentTime();
    newProps.query = query; // defines itinerary search time & arriveBy

    return newProps;
  },
);

IndexPageWithStores.contextTypes = {
  ...IndexPageWithStores.contextTypes,
  executeAction: PropTypes.func.isRequired,
  config: configShape.isRequired,
};

const GeoIndexPage = Geomover(IndexPageWithStores);

export { GeoIndexPage as default, IndexPageWithBreakpoint as Component };
