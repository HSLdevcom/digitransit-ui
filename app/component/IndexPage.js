/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';
import isEmpty from 'lodash/isEmpty';
import d from 'debug';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import loadable from '@loadable/component';
import getRelayEnvironment from '../util/getRelayEnvironment';
import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import storeOrigin from '../action/originActions';
import { addFavourite } from '../action/FavouriteActions';
import storeDestination from '../action/destinationActions';
import withSearchContext from './WithSearchContext';
import { isBrowser } from '../util/browser';
import {
  parseLocation,
  isItinerarySearchObjects,
  navigateTo,
} from '../util/path';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import scrollTop from '../util/scroll';
import FavouritesContainer from './FavouritesContainer';
import DatetimepickerContainer from './DatetimepickerContainer';

const debug = d('IndexPage.js');

const DTAutoSuggest = getRelayEnvironment(
  withSearchContext(
    loadable(
      () => import('@digitransit-component/digitransit-component-autosuggest'),
      { ssr: true },
    ),
  ),
);
const DTAutosuggestPanel = getRelayEnvironment(
  withSearchContext(
    loadable(
      () =>
        import('@digitransit-component/digitransit-component-autosuggest-panel'),
      { ssr: true },
    ),
  ),
);

class IndexPage extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  static propTypes = {
    router: routerShape.isRequired,
    autoSetOrigin: PropTypes.bool,
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    showSpinner: PropTypes.bool.isRequired,
    favourites: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        gtfsId: PropTypes.string,
        gid: PropTypes.string,
        lat: PropTypes.number,
        name: PropTypes.string,
        lon: PropTypes.number,
        selectedIconId: PropTypes.string,
        favouriteId: PropTypes.string,
      }),
    ),
    lang: PropTypes.string,
  };

  static defaultProps = {
    autoSetOrigin: true,
    lang: 'fi',
    favourites: [],
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
        context: '/',
        router: this.props.router,
        base: {},
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

    navigateTo({
      origin: this.props.origin,
      destination: location,
      context: '/',
      router: this.props.router,
    });
  };

  addFavourite = favourite => {
    this.context.executeAction(addFavourite, favourite);
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { intl } = this.context;
    const { breakpoint, destination, origin, favourites, lang } = this.props;

    // const { mapExpanded } = this.state; // TODO verify
    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`} fullscreen bp-${breakpoint}`}
      >
        <CtrlPanel
          instance="hsl"
          language={lang}
          origin={origin}
          position="left"
        >
          <DTAutosuggestPanel
            searchPanelText={intl.formatMessage({
              id: 'where',
              defaultMessage: 'Where to?',
            })}
            origin={origin}
            destination={destination}
            originPlaceHolder="search-origin-index"
            destinationPlaceHolder="search-destination-index"
            lang={lang}
            sources={['Favourite', 'History', 'Datasource']}
            targets={['Locations', 'CurrentPosition']}
          />
          <DatetimepickerContainer realtime />
          <FavouritesContainer
            favourites={favourites}
            onAddFavourite={this.addFavourite}
            onClickFavourite={this.clickFavourite}
          />
          <CtrlPanel.SeparatorLine />
          <div className="stops-near-you-text">
            <span>
              {' '}
              {intl.formatMessage({
                id: 'stop-near-you-title',
                defaultMessage: 'Stops and lines near you',
              })}
            </span>
          </div>
          <DTAutoSuggest
            icon="search"
            id="stop-route-station"
            refPoint={origin}
            className="destination"
            placeholder="stop-near-you"
            value=""
            sources={['Favourite', 'History', 'Datasource']}
            targets={['Stops', 'Routes']}
          />
        </CtrlPanel>
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
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
        <CtrlPanel instance="hsl" language={lang} position="bottom">
          <DTAutosuggestPanel
            searchPanelText={intl.formatMessage({
              id: 'where',
              defaultMessage: 'Where to?',
            })}
            origin={origin}
            destination={destination}
            originPlaceHolder="search-origin-index"
            destinationPlaceHolder="search-destination-index"
            lang={lang}
            sources={['Favourite', 'History', 'Datasource']}
            targets={['Locations', 'CurrentPosition', 'MapPosition']}
          />
          <DatetimepickerContainer realtime />
          <FavouritesContainer
            favourites={this.props.favourites}
            onClickFavourite={this.clickFavourite}
            onAddFavourite={this.addFavourite}
            lang={lang}
          />
          <CtrlPanel.SeparatorLine />
          <div className="stops-near-you-text">
            <span>
              {' '}
              {intl.formatMessage({
                id: 'stop-near-you-title',
                defaultMessage: 'Stops and lines near you',
              })}
            </span>
          </div>
          <DTAutoSuggest
            icon="search"
            id="stop-route-station"
            refPoint={origin}
            className="destination"
            placeholder="stop-near-you"
            value=""
            sources={['Favourite', 'History', 'Datasource']}
            targets={['Stops', 'Routes']}
          />
        </CtrlPanel>
      </div>
    );
  }
}

const Index = shouldUpdate(
  // update only when origin/destination/breakpoint or language changes
  (props, nextProps) => {
    return !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.breakpoint, props.breakpoint) &&
      isEqual(nextProps.lang, props.lang) &&
      isEqual(nextProps.locationState, props.locationState) &&
      isEqual(nextProps.showSpinner, props.showSpinner) &&
      isEmpty(differenceWith(nextProps.favourites, props.favourites, isEqual))
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
  ['PositionStore', 'ViaPointsStore', 'FavouriteStore'],
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
};
export {
  IndexPageWithPosition as default,
  IndexPageWithBreakpoint as Component,
};
