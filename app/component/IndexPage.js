import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import d from 'debug';
import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import LazilyLoad, { importLazy } from './LazilyLoad';
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

const debug = d('IndexPage.js');

const feedbackPanelMudules = {
  Panel: () => importLazy(import('./FeedbackPanel')),
};

const feedbackPanel = (
  <LazilyLoad modules={feedbackPanelMudules}>
    {({ Panel }) => <Panel />}
  </LazilyLoad>
);

class IndexPage extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
    router: routerShape.isRequired,
    piwik: PropTypes.object,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    tab: PropTypes.string,
    showSpinner: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      mapExpanded: false, // Show right-now as default
    };
  }

  componentDidMount() {
    // TODO move this to wrapping component
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') > -1) {
      console.warn('Enabling citybikes');
      this.context.config.transportModes.citybike.defaultValue = true;
    }
    // auto select nearby tab if none selected and bp=large
    if (this.props.tab === undefined) {
      this.clickNearby();
    }
  }

  componentWillReceiveProps = nextProps => {
    this.handleBreakpointProps(nextProps);
    this.handleLocationProps(nextProps);
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

  handleBreakpointProps = nextProps => {
    const frombp = this.props.breakpoint;
    const tobp = nextProps.breakpoint;

    if (frombp === tobp) {
      return;
    }

    if (this.getSelectedTab() === undefined) {
      // auto open nearby tab on bp change to large
      this.clickNearby();
    }
  };

  /* eslint-disable no-param-reassign */
  handleLocationProps = nextProps => {
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
    switch (this.props.tab) {
      case TAB_NEARBY:
        return (
          <NearbyRoutesPanel
            origin={this.props.origin}
            destination={this.props.destination}
          />
        );
      case TAB_FAVOURITES:
        return (
          <FavouritesPanel
            origin={this.props.origin}
            destination={this.props.destination}
          />
        );
      default:
        return null;
    }
  };
  render() {
    const selectedMainTab = this.getSelectedTab();

    return this.props.breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${this.props.origin &&
          this.props.origin.gps === true &&
          this.props.origin.ready === false &&
          this.props.origin.gpsError === false &&
          `blurred`} fullscreen bp-${this.props.breakpoint}`}
      >
        <MapWithTracking
          breakpoint={this.props.breakpoint}
          showStops
          showScaleBar
          origin={this.props.origin}
          activeArea="activeAreaLarge"
        >
          <DTAutosuggestPanel
            origin={this.props.origin}
            destination={this.props.destination}
            tab={this.props.tab}
            originSearchType="all"
            originPlaceHolder="search-origin"
          />
          <div key="foo" className="fpccontainer">
            <FrontPagePanelLarge
              selectedPanel={selectedMainTab}
              nearbyClicked={this.clickNearby}
              favouritesClicked={this.clickFavourites}
            >
              {this.renderTab()}
            </FrontPagePanelLarge>
          </div>
        </MapWithTracking>
        {(this.props.showSpinner && <OverlayWithSpinner />) || null}
        <div id="page-footer-container">
          <PageFooter
            content={
              (this.context.config.footer &&
                this.context.config.footer.content) ||
              []
            }
          />
        </div>
        {feedbackPanel}
      </div>
    ) : (
      <div
        className={`front-page flex-vertical ${this.props.origin &&
          this.props.origin.gps === true &&
          this.props.origin.ready === false &&
          this.props.origin.gpsError === false &&
          `blurred`} fullscreen bp-${this.props.breakpoint}`}
      >
        <div
          className={cx('flex-grow', 'map-container', {
            expanded: this.state.mapExpanded,
          })}
        >
          <MapWithTracking
            breakpoint={this.props.breakpoint}
            showStops
            origin={this.props.origin}
            activeArea="activeAreaSmall"
          >
            {(this.props.showSpinner && <OverlayWithSpinner />) || null}
            <DTAutosuggestPanel
              origin={this.props.origin}
              destination={this.props.destination}
              originSearchType="all"
              originPlaceHolder="search-origin"
              tab={this.props.tab}
            />
          </MapWithTracking>
        </div>
        <div style={{ position: 'relative' }}>
          {
            <div
              className={cx('fullscreen-toggle', {
                expanded: this.state.mapExpanded,
              })}
              onClick={this.togglePanelExpanded}
            >
              {!this.state.mapExpanded ? (
                <Icon img="icon-icon_minimize" className="cursor-pointer" />
              ) : (
                <Icon img="icon-icon_maximize" className="cursor-pointer" />
              )}
            </div>
          }
          <FrontPagePanelSmall
            selectedPanel={selectedMainTab}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
            mapExpanded={this.state.mapExpanded}
            location={this.props.origin}
          >
            {this.renderTab()}
          </FrontPagePanelSmall>
          {feedbackPanel}
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

const IndexPageWithBreakpoint = getContext({
  breakpoint: PropTypes.string.isRequired,
})(Index);

const IndexPageWithLang = connectToStores(
  IndexPageWithBreakpoint,
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
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

const tabs = [TAB_FAVOURITES, TAB_NEARBY];

const IndexPageWithPosition = connectToStores(
  IndexPageWithLang,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    // allow using url without all parameters set. assume:
    // if from == 'lahellasi' or 'suosikit' assume tab = ${from}, from ='-' to '-'
    // if to == 'lahellasi' or 'suosikit' assume tab = ${to}, to = '-'

    let from = props.params.from;
    let to = props.params.to;
    let tab = props.params.tab;
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

    if (isBrowser) {
      newProps.showSpinner = locationState.isLocationingInProgress === true;
      console.log('show spinner', locationState, newProps.showSpinner);

      if (
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
    }
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
