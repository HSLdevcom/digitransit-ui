import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import d from 'debug';
import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import storeOrigin from '../action/originActions';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import PageFooter from './PageFooter';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { isBrowser } from '../util/browser';
import {
  TAB_NEARBY,
  TAB_FAVOURITES,
  parseLocation,
  isItinerarySearchObjects,
  navigateTo,
} from '../util/path';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesPanel from './FavouritesPanel';
import StreetModeSelectorPopup from './StreetModeSelectorPopup';
import events from '../util/events';
import * as ModeUtils from '../util/modeUtils';
import withBreakpoint from '../util/withBreakpoint';

const debug = d('IndexPage.js');

class IndexPage extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
    router: routerShape.isRequired,
    piwik: PropTypes.object,
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    tab: PropTypes.string,
    showSpinner: PropTypes.bool.isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        footerOptions: PropTypes.shape({
          hidden: PropTypes.bool,
        }),
      }).isRequired,
    ).isRequired,
  };

  constructor(props, context) {
    super(props);
    this.state = {
      mapExpanded: false, // Show right-now as default
    };
    context.executeAction(storeOrigin, props.origin);
  }

  componentDidMount() {
    // auto select nearby tab if none selected and bp=large
    if (this.props.tab === undefined) {
      this.clickNearby();
    }

    events.on('popupOpened', this.onPopupOpen);
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

  getSelectedTab = () => {
    switch (this.props.tab) {
      case TAB_FAVOURITES:
        return 2;
      case TAB_NEARBY:
        return 1;
      default:
        return undefined;
    }
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

  trackEvent = (...args) => {
    if (typeof this.context.piwik === 'object') {
      this.context.piwik.trackEvent(...args);
    }
  };

  clickNearby = () => {
    this.openTab(TAB_NEARBY);
    this.trackEvent('Front page tabs', 'Nearby', 'open');
  };

  clickFavourites = () => {
    this.openTab(TAB_FAVOURITES);
    this.trackEvent('Front page tabs', 'Favourites', 'open');
  };

  openTab = tab => {
    navigateTo({
      origin: this.props.origin,
      destination: this.props.destination,
      context: '/',
      router: this.context.router,
      base: {},
      tab,
    });
  };

  togglePanelExpanded = () => {
    this.setState(prevState => ({ mapExpanded: !prevState.mapExpanded }));
  };

  renderTab = () => {
    let Tab;
    switch (this.props.tab) {
      case TAB_NEARBY:
        Tab = NearbyRoutesPanel;
        break;
      case TAB_FAVOURITES:
        Tab = FavouritesPanel;
        break;
      default:
        Tab = NearbyRoutesPanel;
    }
    return (
      <Tab origin={this.props.origin} destination={this.props.destination} />
    );
  };

  renderStreetModeSelector = (config, router, openingDirection = 'down') =>
    config.features.showStreetModeQuickSelect && (
      <StreetModeSelectorPopup
        openingDirection={openingDirection}
        selectedStreetMode={ModeUtils.getStreetMode(router.location, config)}
        selectStreetMode={(streetMode, isExclusive) =>
          ModeUtils.setStreetMode(streetMode, config, router, isExclusive)
        }
        streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
      />
    );

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { config, router } = this.context;
    const { breakpoint, destination, origin, routes, tab } = this.props;
    const { mapExpanded } = this.state;

    const footerOptions = Object.assign(
      {},
      ...routes.map(route => route.footerOptions),
    );
    const selectedMainTab = this.getSelectedTab();
    const openingDirection =
      breakpoint === 'large' || mapExpanded ? 'up' : 'down';

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
            tab={tab}
            searchType="all"
            originPlaceHolder="search-origin"
          />
        </div>
        <div key="foo" className="fpccontainer">
          <FrontPagePanelLarge
            selectedPanel={selectedMainTab}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
          >
            {this.renderTab()}
          </FrontPagePanelLarge>
        </div>
        <MapWithTracking
          breakpoint={breakpoint}
          showStops
          showScaleBar
          origin={origin}
          renderCustomButtons={() =>
            this.renderStreetModeSelector(config, router, openingDirection)
          }
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
            renderCustomButtons={() =>
              this.renderStreetModeSelector(config, router, openingDirection)
            }
          >
            {(this.props.showSpinner && <OverlayWithSpinner />) || null}
            <DTAutosuggestPanel
              origin={origin}
              destination={this.props.destination}
              searchType="all"
              originPlaceHolder="search-origin"
              tab={this.props.tab}
            />
          </MapWithTracking>
        </div>
        <div style={{ position: 'relative' }}>
          <div
            className={cx('fullscreen-toggle', {
              expanded: mapExpanded,
            })}
            onClick={this.togglePanelExpanded}
          >
            {mapExpanded ? (
              <Icon img="icon-icon_minimize" className="cursor-pointer" />
            ) : (
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            )}
          </div>
          <FrontPagePanelSmall
            selectedPanel={selectedMainTab}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
            mapExpanded={mapExpanded}
            location={origin}
          >
            {this.renderTab()}
          </FrontPagePanelSmall>
        </div>
      </div>
    );
  }
}

const Index = shouldUpdate(
  // update only when origin/destination/tab/breakpoint or language changes
  (props, nextProps) =>
    !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.tab, props.tab) &&
      isEqual(nextProps.breakpoint, props.breakpoint) &&
      isEqual(nextProps.lang, props.lang) &&
      isEqual(nextProps.locationState, props.locationState) &&
      isEqual(nextProps.showSpinner, props.showSpinner)
    ),
)(IndexPage);

const IndexPageWithBreakpoint = withBreakpoint(Index);

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

const tabs = [TAB_FAVOURITES, TAB_NEARBY];

const IndexPageWithPosition = connectToStores(
  IndexPageWithBreakpoint,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    // allow using url without all parameters set. assume:
    // if from == 'lahellasi' or 'suosikit' assume tab = ${from}, from ='-' to '-'
    // if to == 'lahellasi' or 'suosikit' assume tab = ${to}, to = '-'

    let { from, to, tab } = props.params;
    let redirect = false;

    if (tabs.indexOf(from) !== -1) {
      tab = from;
      from = '-';
      to = '-';
      redirect = true;
    } else if (tabs.indexOf(to) !== -1) {
      tab = to;
      to = '-';
      redirect = true;
    }

    const newProps = {};

    if (tab) {
      newProps.tab = tab;
    }

    newProps.locationState = locationState;
    newProps.origin = processLocation(from, locationState, context.intl);
    newProps.destination = processLocation(to, locationState, context.intl);

    if (redirect) {
      navigateTo({
        origin: newProps.origin,
        destination: newProps.destination,
        context: '/',
        router: context.router,
        base: {},
        tab: newProps.tab,
      });
    }

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
            tab: newProps.tab,
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
  location: locationShape.isRequired,
  router: routerShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  intl: intlShape,
};

export default IndexPageWithPosition;
