import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import d from 'debug';

import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import storeOrigin from '../action/originActions';
import MapWithTracking from './map/MapWithTracking';
import PageFooter from './PageFooter';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { isBrowser } from '../util/browser';
import {
  parseLocation,
  isItinerarySearchObjects,
  navigateTo,
} from '../util/path';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import SelectMapLayersDialog from './SelectMapLayersDialog';
import SelectStreetModeDialog from './SelectStreetModeDialog';
import events from '../util/events';
import * as ModeUtils from '../util/modeUtils';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import scrollTop from '../util/scroll';

const debug = d('IndexPage.js');

class IndexPage extends React.Component {
  static contextTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
      hash: PropTypes.string,
      state: PropTypes.object,
      query: PropTypes.object,
    }).isRequired,
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    autoSetOrigin: PropTypes.bool,
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    showSpinner: PropTypes.bool.isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        footerOptions: PropTypes.shape({
          hidden: PropTypes.bool,
        }),
      }).isRequired,
    ).isRequired,
  };

  static defaultProps = {
    autoSetOrigin: true,
  };

  constructor(props, context) {
    super(props);
    this.state = {
      mapExpanded: false, // Show right-now as default
    };
    if (this.props.autoSetOrigin) {
      context.executeAction(storeOrigin, props.origin);
    }
  }

  componentDidMount() {
    events.on('popupOpened', this.onPopupOpen);
    scrollTop();
  }

  componentWillReceiveProps = nextProps => {
    this.handleLocationProps(nextProps);
  };

  componentWillUnmount() {
    events.removeListener('popupOpened', this.onPopupOpen);
  }

  onPopupOpen = () => {
    this.setState({ mapExpanded: true });
  };

  /* eslint-disable no-param-reassign */
  handleLocationProps = nextProps => {
    if (!isEqual(nextProps.origin, this.props.origin)) {
      this.context.executeAction(storeOrigin, nextProps.origin);
    }

    if (isItinerarySearchObjects(nextProps.origin, nextProps.destination)) {
      debug('Redirecting to itinerary summary page');
      navigateTo({
        origin: nextProps.origin,
        destination: nextProps.destination,
        context: '/',
        router: this.context.router,
        base: {},
      });
    }
  };

  renderStreetModeSelector = (config, router) => (
    <SelectStreetModeDialog
      selectedStreetMode={ModeUtils.getStreetMode(router.location, config)}
      selectStreetMode={(streetMode, isExclusive) => {
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'SelectTravelingModeFromIndexPage',
          name: streetMode,
        });
        ModeUtils.setStreetMode(streetMode, config, router, isExclusive);
      }}
      streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
    />
  );

  renderMapLayerSelector = () => <SelectMapLayersDialog />;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { config, router } = this.context;
    const { breakpoint, destination, origin, routes } = this.props;
    const { mapExpanded } = this.state;

    const footerOptions = Object.assign(
      {},
      ...routes.map(route => route.footerOptions),
    );

    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`} fullscreen bp-${breakpoint}`}
      >
        <div className="search-container">
          <DTAutosuggestPanel
            origin={origin}
            destination={destination}
            searchType="all"
            originPlaceHolder="search-origin"
            destinationPlaceHolder="search-destination"
          />
        </div>
        <MapWithTracking
          breakpoint={breakpoint}
          showStops
          showScaleBar
          origin={origin}
          destination={destination}
          renderCustomButtons={() => (
            <React.Fragment>
              {this.renderStreetModeSelector(config, router)}
              {this.renderMapLayerSelector()}
            </React.Fragment>
          )}
        />
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
        {!footerOptions.hidden && (
          <div id="page-footer-container">
            <PageFooter
              content={(config.footer && config.footer.content) || []}
            />
          </div>
        )}
      </div>
    ) : (
      <div
        className={`front-page flex-vertical ${origin &&
          origin.gps === true &&
          origin.ready === false &&
          origin.gpsError === false &&
          `blurred`} fullscreen bp-${breakpoint}`}
      >
        <div
          className={cx('flex-grow', 'map-container', {
            expanded: mapExpanded,
          })}
        >
          <MapWithTracking
            breakpoint={breakpoint}
            showStops
            origin={origin}
            destination={destination}
            renderCustomButtons={() => (
              <React.Fragment>
                {this.renderStreetModeSelector(config, router)}
                {this.renderMapLayerSelector()}
              </React.Fragment>
            )}
          >
            {(this.props.showSpinner && <OverlayWithSpinner />) || null}
            <DTAutosuggestPanel
              origin={origin}
              destination={this.props.destination}
              searchType="all"
              originPlaceHolder="search-origin"
            />
          </MapWithTracking>
        </div>
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
      isEqual(nextProps.showSpinner, props.showSpinner)
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
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const { from, to } = props.params;

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
            router: context.router,
            base: {},
          });
        }
      });
    }
    newProps.lang = context.getStore('PreferencesStore').getLanguage();

    return newProps;
  },
);

IndexPageWithPosition.contextTypes = {
  ...IndexPageWithPosition.contextTypes,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string,
    hash: PropTypes.string,
    state: PropTypes.object,
    query: PropTypes.object,
  }).isRequired,
  router: routerShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  intl: intlShape,
};

export {
  IndexPageWithPosition as default,
  IndexPageWithBreakpoint as Component,
};
