/* eslint-disable react/no-unused-state */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import d from 'debug';
import suggestionToLocation from '../util/suggestionUtils';
import { getJson } from '../util/xhrPromise';
import { withCurrentTime } from '../util/searchUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';
import ControlPanel from './ControlPanel';
import DTAutoSuggest from './DTAutosuggest';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import PageFooter from './PageFooter';
import { isBrowser } from '../util/browser';
import searchContext from './searchContext';
import {
  parseLocation,
  isItinerarySearchObjects,
  navigateTo,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import intializeSearchContext from './DTSearchContextInitializer';
import scrollTop from '../util/scroll';
import FavouriteLocationsContainer from './FavouriteLocationsContainer';
import getRelayEnvironment from '../util/getRelayEnvironment';

const debug = d('IndexPage.js');

class IndexPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    router: routerShape.isRequired,
    autoSetOrigin: PropTypes.bool,
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    showSpinner: PropTypes.bool.isRequired,
    favourites: PropTypes.array,
    getViaPointsFromMap: PropTypes.bool.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
    locationState: PropTypes.object.isRequired,
  };

  static defaultProps = {
    autoSetOrigin: true,
  };

  constructor(props, context) {
    super(props);
    if (this.props.autoSetOrigin) {
      context.executeAction(storeOrigin, props.origin);
    }
    this.state = {
      pendingCurrentLocation: false,
    };
  }

  componentDidMount() {
    intializeSearchContext(
      this.context,
      searchContext,
      this.props.relayEnvironment,
    );
    scrollTop();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps = nextProps => {
    this.handleLocationProps(nextProps);
  };

  /* eslint-disable no-param-reassign */
  handleLocationProps = nextProps => {
    if (!isEqual(nextProps.origin, this.props.origin)) {
      this.context.executeAction(storeOrigin, nextProps.origin);
    }
    if (!isEqual(nextProps.destination, this.props.destination)) {
      this.context.executeAction(storeDestination, nextProps.destination);
    }

    if (isItinerarySearchObjects(nextProps.origin, nextProps.destination)) {
      debug('Redirecting to itinerary summary page');
      navigateTo({
        origin: nextProps.origin,
        destination: nextProps.destination,
        context: '/',
        router: this.props.router,
        base: {},
      });
    }
  };

  onLocationSelected = location => {
    // console.log('onlocationselected')
    const locationWithTime = withCurrentTime(
      this.context.getStore,
      this.context.match.location,
    );
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: location.type,
    });

    let updatedOrigin = origin;
    let destination = { ...location, ready: true };
    if (location.type === 'CurrentLocation') {
      destination = {
        ...location,
        gps: true,
        ready: !!location.lat,
      };
      if (origin.gps === true) {
        updatedOrigin = { set: false };
      }
    }

    navigateTo({
      base: locationWithTime,
      origin: updatedOrigin,
      destination,
      // is iitnirerary
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
    });
  };

  finishSelect = (item, type) => {
    if (item.type.indexOf('Favourite') === -1) {
      this.context.executeAction(searchContext.saveSearch, {
        item,
        type,
      });
    }
    // this.onSelect(item, type);
  };

  onSuggestionSelected = item => {
    // console.log('oss')
    // preferred route selection
    // if (this.props.isPreferredRouteSearch && this.props.onRouteSelected) {
    //   this.props.onRouteSelected(item);
    //   return;
    // }
    // route
    if (item.properties.link) {
      this.context.router.push(item.properties.link);
      return;
    }
    // console.log( suggestionToLocation);
    const location = suggestionToLocation(item);
    if (item.properties.layer === 'currentPosition' && !item.properties.lat) {
      this.setState({ pendingCurrentLocation: true }, () =>
        this.context.executeAction(searchContext.startLocationWatch),
      );
    } else {
      this.onLocationSelected(location);
    }
  };

  onSelect = item => {
    // console.log('onselect')
    // type is destination unless timetable or route was clicked
    let type = 'endpoint';
    switch (item.type) {
      case 'Route':
        type = 'search';
        break;
      default:
    }

    if (item.type === 'OldSearch' && item.properties.gid) {
      getJson(this.context.config.URL.PELIAS_PLACE, {
        ids: item.properties.gid,
      }).then(data => {
        const newItem = { ...item };
        if (data.features != null && data.features.length > 0) {
          // update only position. It is surprising if, say, the name changes at selection.
          const geom = data.features[0].geometry;
          newItem.geometry.coordinates = geom.coordinates;
        }
        this.finishSelect(newItem, type);
        this.onSuggestionSelected(item);
      });
    } else {
      this.finishSelect(item, type);
      this.onSuggestionSelected(item);
    }
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { config, intl } = this.context;
    const { breakpoint, destination, origin, favourites } = this.props;
    // DT-3381 TODO: DTEndpointAutoSuggest currently does not search for stops or stations, as it should be. SearchUtils needs refactoring.
    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`} fullscreen bp-${breakpoint}`}
      >
        <ControlPanel className="control-panel-container-left">
          <DTAutosuggestPanel
            searchPanelText={intl.formatMessage({
              id: 'where',
              defaultMessage: 'Where to?',
            })}
            origin={origin}
            onSelect={this.onSelect}
            destination={destination}
            searchType="endpoint"
            originPlaceHolder="search-origin-index"
            destinationPlaceHolder="search-destination-index"
            searchContext={searchContext}
            locationState={this.props.locationState}
            onLocationSelected={this.onLocationSelected}
            getViaPointsFromMap={this.props.getViaPointsFromMap}
          />
          <div className="fpcfloat">
            <div className="frontpage-panel">
              <FavouriteLocationsContainer
                origin={origin}
                favourites={favourites}
              />
            </div>
          </div>
          <div className="control-panel-separator-line" />
          <div className="stops-near-you-text">
            <span>
              {' '}
              {intl.formatMessage({
                id: 'stop-near-you-title',
                defaultMessage: 'Stops and lines near you',
              })}
            </span>
          </div>
          <div>
            <DTAutoSuggest
              icon="mapMarker-via"
              id="searchfield-preferred"
              autoFocus={false}
              refPoint={origin}
              className="destination"
              searchType="search"
              placeholder="stop-near-you"
              value=""
              onSelect={this.onSelect}
              isFocused={this.isFocused}
              onLocationSelected={e => e.stopPropagation()}
              searchContext={searchContext}
              locationState={this.props.locationState}
            />
          </div>
        </ControlPanel>
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
        <div id="page-footer-container">
          <PageFooter
            content={(config.footer && config.footer.content) || []}
          />
        </div>
      </div>
    ) : (
      <div
        className={`front-page flex-vertical ${origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`} bp-${breakpoint}`}
      >
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
        <ControlPanel className="control-panel-container-bottom">
          <DTAutosuggestPanel
            searchPanelText={intl.formatMessage({
              id: 'where',
              defaultMessage: 'Where to?',
            })}
            origin={origin}
            destination={destination}
            searchType="all"
            onSelect={this.onSelect}
            onLocationSelected={this.onLocationSelected}
            originPlaceHolder="search-origin"
            destinationPlaceHolder="search-destination"
            searchContext={searchContext}
            locationState={this.props.locationState}
          />
          <div className="fpcfloat">
            <div className="frontpage-panel">
              <FavouriteLocationsContainer favourites={this.props.favourites} />
            </div>
          </div>
          <div className="control-panel-separator-line" />
          <div className="stops-near-you-text">
            <span>
              {' '}
              {intl.formatMessage({
                id: 'stop-near-you-title',
                defaultMessage: 'Stops and lines near you',
              })}
            </span>
          </div>
          <div>
            <DTAutoSuggest
              icon="mapMarker-via"
              id="searchfield-preferred-bottom"
              autoFocus={false}
              refPoint={origin}
              className="destination"
              searchType="search"
              placeholder="stop-near-you"
              value=""
              onSelect={this.onSelect}
              isFocused={this.isFocused}
              onLocationSelected={e => e.stopPropagation()}
              searchContext={searchContext}
              locationState={this.props.locationState}
            />
          </div>
        </ControlPanel>
      </div>
    );
  }
}

const Index = shouldUpdate(
  // update only when origin/destination/breakpoint or language changes
  (props, nextProps) =>
    !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.breakpoint, props.breakpoint) &&
      isEqual(nextProps.lang, props.lang) &&
      isEqual(nextProps.locationState, props.locationState) &&
      isEqual(nextProps.showSpinner, props.showSpinner) &&
      isEqual(nextProps.favourites, props.favourites)
    ),
)(IndexPage);

const IndexPageWithBreakpoint = withBreakpoint(Index);

IndexPageWithBreakpoint.description = (
  <ComponentUsageExample isFullscreen>
    <IndexPageWithBreakpoint
      autoSetOrigin={false}
      destination={{
        ready: false,
        set: false,
      }}
      origin={{
        ready: false,
        set: false,
      }}
      routes={[]}
      showSpinner={false}
    />
  </ComponentUsageExample>
);

/* eslint-disable no-param-reassign */
const processLocation = (locationString, locationState, intl) => {
  let location;
  if (locationString) {
    location = parseLocation(locationString);

    if (location.gps === true) {
      if (
        locationState.lat &&
        locationState.lon &&
        locationState.address !== undefined // address = "" when reverse geocoding cannot return address
      ) {
        location.ready = true;
        location.lat = locationState.lat;
        location.lon = locationState.lon;
        location.address =
          locationState.address ||
          intl.formatMessage({
            id: 'own-position',
            defaultMessage: 'Own Location',
          });
      }
      const gpsError = locationState.locationingFailed === true;

      location.gpsError = gpsError;
    }
  } else {
    location = { set: false };
  }
  return location;
};

const IndexPageWithPosition = connectToStores(
  IndexPageWithBreakpoint,
  ['PositionStore', 'ViaPointsStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const { from, to } = props.match.params;

    const newProps = {};

    newProps.locationState = locationState;
    newProps.origin = processLocation(from, locationState, context.intl);
    newProps.destination = processLocation(to, locationState, context.intl);

    newProps.showSpinner = locationState.isLocationingInProgress === true;

    if (
      isBrowser &&
      locationState.isLocationingInProgress !== true &&
      locationState.hasLocation === false &&
      (newProps.origin.gps === true || newProps.destination.gps === true)
    ) {
      checkPositioningPermission().then(status => {
        if (
          // check logic for starting geolocation
          status.state === 'granted' &&
          locationState.status === 'no-location'
        ) {
          debug('Auto Initialising geolocation');

          context.executeAction(initGeolocation);
        } else {
          // clear gps & redirect
          if (newProps.origin.gps === true) {
            newProps.origin.gps = false;
            newProps.origin.set = false;
          }

          if (newProps.destination.gps === true) {
            newProps.destination.gps = false;
            newProps.destination.set = false;
          }

          debug('Redirecting away from POS');
          navigateTo({
            origin: newProps.origin,
            destination: newProps.destination,
            context: '/',
            router: props.router,
            base: {},
          });
        }
      });
    }
    newProps.lang = context.getStore('PreferencesStore').getLanguage();
    newProps.getViaPointsFromMap = context
      .getStore('ViaPointsStore')
      .getViaPoints();
    newProps.favourites = [
      ...context.getStore('FavouriteStore').getLocations(),
      ...context.getStore('FavouriteStore').getStopsAndStations(),
    ];
    return newProps;
  },
);

IndexPageWithPosition.contextTypes = {
  ...IndexPageWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
  intl: intlShape,
};
const withRelay = getRelayEnvironment(IndexPageWithPosition);
export { withRelay as default, IndexPageWithBreakpoint as Component };
