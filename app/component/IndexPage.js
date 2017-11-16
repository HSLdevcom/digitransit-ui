import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import { initGeolocation } from '../action/PositionActions';
import LazilyLoad, { importLazy } from './LazilyLoad';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import PageFooter from './PageFooter';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { getPositioningHasSucceeded } from '../store/localStorage';
import { isBrowser } from '../util/browser';
import {
  TAB_NEARBY,
  TAB_FAVOURITES,
  parseLocation,
  getPathWithEndpointObjects,
  isItinerarySearchObjects,
} from '../util/path';
import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesPanel from './FavouritesPanel';

const feedbackPanelMudules = {
  Panel: () => importLazy(import('./FeedbackPanel')),
};

const feedbackPanel = (
  <LazilyLoad modules={feedbackPanelMudules}>
    {({ Panel }) => <Panel />}
  </LazilyLoad>
);

const messageBarModules = { Bar: () => importLazy(import('./MessageBar')) };

const messageBar = (
  <LazilyLoad modules={messageBarModules}>{({ Bar }) => <Bar />}</LazilyLoad>
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
      const url = getPathWithEndpointObjects(
        nextProps.origin,
        nextProps.destination,
      );
      this.context.router.replace(url);
    }
  };

  trackEvent = (...args) => {
    if (typeof this.context.piwik === 'object') {
      this.context.piwik.trackEvent(...args);
    }
  };

  clickNearby = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      const selected = this.getSelectedTab();
      this.openNearby(selected === 2);

      this.trackEvent(
        'Front page tabs',
        'Nearby',
        selected === 1 ? 'close' : 'open',
      );
    } else {
      this.openNearby(true);
      this.trackEvent('Front page tabs', 'Nearby', 'open');
    }
  };

  clickFavourites = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      const selected = this.getSelectedTab();

      this.openFavourites(selected === 1);

      this.trackEvent(
        'Front page tabs',
        'Favourites',
        selected === 2 ? 'close' : 'open',
      );
    } else {
      this.openFavourites(true);
      this.trackEvent('Front page tabs', 'Favourites', 'open');
    }
  };

  openFavourites = replace => {
    // const [, origin, destination] = this.context.location.pathname.split('/');
    const url = getPathWithEndpointObjects(
      this.props.origin,
      this.props.destination,
      TAB_FAVOURITES,
    );
    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

  openNearby = replace => {
    const url = getPathWithEndpointObjects(
      this.props.origin,
      this.props.destination,
      TAB_NEARBY,
    );

    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
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
        className={`front-page flex-vertical fullscreen bp-${this.props
          .breakpoint}`}
      >
        {messageBar}
        <MapWithTracking
          breakpoint={this.props.breakpoint}
          showStops
          showScaleBar
          origin={this.props.origin}
        >
          <DTAutosuggestPanel
            origin={this.props.origin}
            destination={this.props.destination}
            tab={this.props.tab}
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
        {(this.props.origin &&
          this.props.origin.gps === true &&
          this.props.origin.ready === false &&
          this.props.origin.gpsError === false && <OverlayWithSpinner />) ||
          null}
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
        className={`front-page flex-vertical fullscreen bp-${this.props
          .breakpoint}`}
      >
        {messageBar}
        <div
          className={cx('flex-grow', 'map-container', {
            expanded: this.state.mapExpanded,
          })}
        >
          <MapWithTracking
            breakpoint={this.props.breakpoint}
            showStops
            origin={this.props.origin}
          >
            {(this.props.origin &&
              this.props.origin.gps === true &&
              this.props.origin.gpsError === false &&
              this.props.origin.ready === false && <OverlayWithSpinner />) ||
              null}
            <DTAutosuggestPanel
              origin={this.props.origin}
              destination={this.props.destination}
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
      isEqual(nextProps.lang, props.lang)
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
const processLocation = (locationString, locationState) => {
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
        location.address = locationState.address;
      }
      const gpsError =
        [
          'no-location',
          'prompt',
          'searching-location',
          'found-location',
          'found-address',
        ].indexOf(locationState.status) === -1;

      location.gpsError = gpsError;
    }
  } else {
    location = { set: false };
  }
  return location;
};

const IndexPageWithPosition = connectToStores(
  IndexPageWithLang,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const newProps = {};

    if (props.params.tab) {
      newProps.tab = props.params.tab;
    }

    newProps.origin = processLocation(props.params.from, locationState);

    newProps.destination = processLocation(props.params.to, locationState);

    // if we have record of succesfull positioning let's init geolocating
    if (
      locationState.status === 'no-location' &&
      (getPositioningHasSucceeded() === true ||
        newProps.destination.gps === true ||
        newProps.origin.gps === true)
    ) {
      if (isBrowser) {
        context.executeAction(initGeolocation);
      }
    }

    // automatically use current pos when coming to front page and no
    // origin/destination is set
    if (
      getPositioningHasSucceeded() === true &&
      newProps.destination.set === false &&
      newProps.origin.set === false
    ) {
      if (
        ['searching-location', 'found-location', 'found-address'].indexOf(
          locationState.status,
        ) !== -1
      ) {
        context.router.replace(`/POS/-/${TAB_NEARBY}`);
      }
    }
    return newProps;
  },
);

IndexPageWithPosition.contextTypes.router = routerShape.isRequired;
IndexPageWithPosition.contextTypes.executeAction = PropTypes.func.isRequired;
IndexPageWithPosition.contextTypes.location = locationShape.isRequired;

export default IndexPageWithPosition;
