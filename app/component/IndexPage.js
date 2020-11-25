/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape, Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import d from 'debug';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import TrafficNowLink from '@digitransit-component/digitransit-component-traffic-now-link';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';
import withSearchContext from './WithSearchContext';
import { isBrowser } from '../util/browser';
import {
  parseLocation,
  isItinerarySearchObjects,
  navigateTo,
  PREFIX_NEARYOU,
} from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import scrollTop from '../util/scroll';
import FavouritesContainer from './FavouritesContainer';
import DatetimepickerContainer from './DatetimepickerContainer';
import { LightenDarkenColor } from '../util/colorUtils';

const debug = d('IndexPage.js');

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);

class IndexPage extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    router: routerShape.isRequired,
    autoSetOrigin: PropTypes.bool,
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    showSpinner: PropTypes.bool.isRequired,
    lang: PropTypes.string,
    currentTime: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    query: PropTypes.object.isRequired,
    favouriteModalAction: PropTypes.string,
    fromMap: PropTypes.string,
  };

  static defaultProps = {
    autoSetOrigin: true,
    lang: 'fi',
  };

  constructor(props, context) {
    super(props);
    if (this.props.autoSetOrigin) {
      context.executeAction(storeOrigin, props.origin);
    }
    this.state = {
      // eslint-disable-next-line react/no-unused-state
      pendingCurrentLocation: false,
    };
  }

  componentDidMount() {
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
        rootPath: `${this.context.config.indexPath}`,
        router: this.props.router,
        base: this.context.match.location,
      });
    }
  };

  clickFavourite = favourite => {
    const location = {
      lat: favourite.lat,
      lon: favourite.lon,
      address: favourite.name,
      ready: true,
    };

    addAnalyticsEvent({
      category: 'Favourite',
      action: 'ClickFavourite',
      name: null,
    });

    navigateTo({
      origin: this.props.origin,
      destination: location,
      rootPath: `${this.context.config.indexPath}`,
      router: this.props.router,
      base: this.context.match.location,
    });
  };

  // DT-3551: handle logic for Traffic now link
  trafficNowHandler = (e, lang) => {
    window.location = `${this.context.config.URL.ROOTLINK}/${
      lang === 'fi' ? '' : `${lang}/`
    }${this.context.config.trafficNowLink[lang]}`;
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { intl, config } = this.context;
    const { trafficNowLink, colors } = config;
    const color = colors.primary;
    const hoverColor = colors.hover || LightenDarkenColor(colors.primary, -20);
    const { breakpoint, destination, origin, lang } = this.props;
    const queryString = this.context.match.location.search;
    const searchSources =
      breakpoint !== 'large'
        ? ['Favourite', 'History', 'Datasource']
        : ['History', 'Datasource'];
    const stopAndRouteSearchSources = ['Favourite', 'History', 'Datasource'];
    const locationSearchTargets = [
      'Locations',
      'CurrentPosition',
      'FutureRoutes',
      'SelectFromOwnLocations',
    ];
    const stopAndRouteSearchTargets =
      this.context.config.cityBike && this.context.config.cityBike.showCityBikes
        ? ['Stops', 'Routes', 'BikeRentalStations']
        : ['Stops', 'Routes'];

    const originToStopNearYou = {
      ...origin,
      queryString,
    };
    // const { mapExpanded } = this.state; // TODO verify

    const alertsContext = {
      currentTime: this.props.currentTime,
      getModesWithAlerts,
    };

    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${
          origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`
        } fullscreen bp-${breakpoint}`}
      >
        <div
          style={{ display: isBrowser ? 'block' : 'none' }}
          className="scrollable-content-wrapper momentum-scroll"
        >
          <CtrlPanel
            instance="hsl"
            language={lang}
            origin={origin}
            position="left"
          >
            <DTAutosuggestPanelWithSearchContext
              appElement="#app"
              searchPanelText={intl.formatMessage({
                id: 'where',
                defaultMessage: 'Where to?',
              })}
              origin={origin}
              destination={destination}
              originPlaceHolder="search-origin-index"
              destinationPlaceHolder="search-destination-index"
              lang={lang}
              sources={searchSources}
              targets={locationSearchTargets}
              breakpoint="large"
              color={color}
              hoverColor={hoverColor}
            />
            <div className="datetimepicker-container">
              <DatetimepickerContainer realtime color={color} />
            </div>
            <FavouritesContainer
              favouriteModalAction={this.props.favouriteModalAction}
              onClickFavourite={this.clickFavourite}
              lang={lang}
            />
            <CtrlPanel.SeparatorLine usePaddingBottom20 />
            {config.showNearYouButtons ? (
              <div className="near-you-buttons-container">
                <CtrlPanel.NearStopsAndRoutes
                  modes={config.nearYouModes}
                  urlPrefix={`/${PREFIX_NEARYOU}`}
                  language={lang}
                  showTitle
                  alertsContext={alertsContext}
                  LinkComponent={Link}
                  origin={originToStopNearYou}
                />
              </div>
            ) : (
              config.showStopAndRouteSearch && (
                <div className="stops-near-you-text">
                  <h2>
                    {' '}
                    {intl.formatMessage({
                      id: 'stop-near-you-title',
                      defaultMessage: 'Stops and lines near you',
                    })}
                  </h2>
                </div>
              )
            )}
            {config.showStopAndRouteSearch && (
              <>
                <DTAutoSuggestWithSearchContext
                  appElement="#app"
                  icon="search"
                  id="stop-route-station"
                  refPoint={origin}
                  className="destination"
                  placeholder="stop-near-you"
                  value=""
                  sources={stopAndRouteSearchSources}
                  targets={stopAndRouteSearchTargets}
              color={color}
              hoverColor={hoverColor}
                />
                <CtrlPanel.SeparatorLine />
              </>
            )}
            {!trafficNowLink ||
              (trafficNowLink[lang] !== '' && (
                <TrafficNowLink
                  lang={lang}
                  handleClick={this.trafficNowHandler}
                />
              ))}
          </CtrlPanel>
        </div>
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
      </div>
    ) : (
      <div
        className={`front-page flex-vertical ${
          origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`
        } bp-${breakpoint}`}
      >
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
        <div
          style={{
            display: isBrowser ? 'block' : 'none',
            backgroundColor: '#ffffff',
          }}
        >
          <CtrlPanel instance="hsl" language={lang} position="bottom">
            <DTAutosuggestPanelWithSearchContext
              appElement="#app"
              searchPanelText={intl.formatMessage({
                id: 'where',
                defaultMessage: 'Where to?',
              })}
              origin={origin}
              destination={destination}
              originPlaceHolder="search-origin-index"
              destinationPlaceHolder="search-destination-index"
              lang={lang}
              sources={searchSources}
              targets={[
                'Locations',
                'CurrentPosition',
                'MapPosition',
                'FutureRoutes',
              ]}
              disableAutoFocus
              isMobile
              breakpoint="small"
              fromMap={this.props.fromMap}
              color={color}
              hoverColor={hoverColor}
            />
            <div className="datetimepicker-container">
              <DatetimepickerContainer realtime color={color} />
            </div>
            <FavouritesContainer
              onClickFavourite={this.clickFavourite}
              lang={lang}
              isMobile
            />
            <CtrlPanel.SeparatorLine />
            {config.showNearYouButtons ? (
              <div className="near-you-buttons-container">
                <CtrlPanel.NearStopsAndRoutes
                  modes={config.nearYouModes}
                  urlPrefix={`/${PREFIX_NEARYOU}`}
                  language={lang}
                  showTitle
                  alertsContext={alertsContext}
                  LinkComponent={Link}
                  origin={originToStopNearYou}
                />
              </div>
            ) : (
              config.showStopAndRouteSearch && (
                <div className="stops-near-you-text">
                  <h2>
                    {' '}
                    {intl.formatMessage({
                      id: 'stop-near-you-title',
                      defaultMessage: 'Stops and lines near you',
                    })}
                  </h2>
                </div>
              )
            )}
            {config.showStopAndRouteSearch && (
              <>
                <DTAutoSuggestWithSearchContext
                  appElement="#app"
                  icon="search"
                  id="stop-route-station"
                  refPoint={origin}
                  className="destination"
                  placeholder="stop-near-you"
                  value=""
                  sources={stopAndRouteSearchSources}
                  targets={stopAndRouteSearchTargets}
                  isMobile
              color={color}
              hoverColor={hoverColor}
                />
                <CtrlPanel.SeparatorLine />
              </>
            )}
            {!trafficNowLink ||
              (trafficNowLink[lang] !== '' && (
                <TrafficNowLink
                  lang={lang}
                  handleClick={this.trafficNowHandler}
                />
              ))}
          </CtrlPanel>

        </div>
      </div>
    );
  }
}

const Index = shouldUpdate(
  // update only when origin/destination/breakpoint, favourite store status or language changes
  (props, nextProps) => {
    return !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.breakpoint, props.breakpoint) &&
      isEqual(nextProps.lang, props.lang) &&
      isEqual(nextProps.locationState, props.locationState) &&
      isEqual(nextProps.showSpinner, props.showSpinner) &&
      isEqual(nextProps.query, props.query)
    );
  },
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
  ['PositionStore', 'TimeStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();
    const currentTime = context.getStore('TimeStore').getCurrentTime().unix();
    const { from, to } = props.match.params;
    const { location } = props.match;
    const { query } = location;
    const { favouriteModalAction, fromMap } = query;

    const newProps = {};
    if (favouriteModalAction) {
      newProps.favouriteModalAction = favouriteModalAction;
    }
    if (fromMap === 'origin' || fromMap === 'destination') {
      newProps.fromMap = fromMap;
    }

    newProps.lang = context.getStore('PreferencesStore').getLanguage();
    newProps.locationState = locationState;
    newProps.currentTime = currentTime;
    newProps.origin = processLocation(from, locationState, context.intl);
    newProps.destination = processLocation(to, locationState, context.intl);
    newProps.query = query; // defines itinerary search time & arriveBy
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
        } else if (status.state === 'prompt') {
          debug('Still prompting');
          // eslint-disable-next-line no-useless-return
          return;
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
            rootPath: `${context.config.indexPath}`,
            router: props.router,
            base: location,
          });
        }
      });
    }
    return newProps;
  },
);

IndexPageWithPosition.contextTypes = {
  ...IndexPageWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
export {
  IndexPageWithPosition as default,
  IndexPageWithBreakpoint as Component,
};
