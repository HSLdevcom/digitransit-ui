import PropTypes from 'prop-types';
import React from 'react';
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
  getEndpointPath,
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
    params: PropTypes.object,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    tab: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      panelExpanded: true, // Show right-now as default
    };
  }

  componentDidMount() {
    // TODO move this to wrapping component
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.config.transportModes.citybike.defaultValue = true;
    }
    // auto select nearby tab if none selected and bp=large
    if (this.props.tab === undefined) {
      this.clickNearby();
    }
  }

  componentWillReceiveProps = nextProps => {
    this.handleBreakpointProps(nextProps);
    this.handleOriginProps(nextProps);
  };

  getSelectedTab = () => {
    switch (this.props.tab) {
      case 'suosikit':
        return 2;
      case 'lahellasi':
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

    // auto close any tab on bp change from large
    if (this.getSelectedTab() === undefined) {
      // auto open nearby tab on bp change to large
      this.clickNearby();
    }
  };

  handleOriginProps = nextProps => {
    if (isItinerarySearchObjects(nextProps.origin, nextProps.destination)) {
      // TODO handle destination gps too

      const realOrigin = { ...nextProps.origin };
      realOrigin.gps = false;

      const url = getPathWithEndpointObjects(realOrigin, nextProps.destination);
      this.context.router.replace(url);
      return;
    }

    if (this.props.params.origin === nextProps.params.origin) {
      // noop, we're there already
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
    const [, origin, destination] = this.context.location.pathname.split('/');
    const url = `${getEndpointPath(origin, destination)}/suosikit`;
    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

  openNearby = replace => {
    const [, origin, destination] = this.context.location.pathname.split('/');
    const url = `${getEndpointPath(origin, destination)}/lahellasi`;

    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

  // used only in mobile with fullscreen tabs
  closeTab = () => {
    if (this.context.location && this.context.location.action === 'PUSH') {
      // entered the tab from the index page, not by a direct url
      this.context.router.goBack();
    } else {
      this.context.router.replace('/');
    }
  };

  togglePanelExpanded = () => {
    this.setState(prevState => ({ panelExpanded: !prevState.panelExpanded }));
  };

  renderTab = () => {
    switch (this.props.tab) {
      case 'lahellasi':
        return (
          <NearbyRoutesPanel
            origin={this.props.origin}
            destination={this.props.destination}
          />
        );
      case 'suosikit':
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
        {this.props.origin &&
          this.props.origin.gps === true &&
          this.props.origin.ready === false &&
          this.props.origin.gpsError === false && <OverlayWithSpinner />}
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
        <div className="flex-grow map-container">
          <MapWithTracking
            breakpoint={this.props.breakpoint}
            showStops
            origin={this.props.origin}
          >
            {this.props.origin &&
              this.props.origin.gps === true &&
              this.props.origin.gpsError === false &&
              this.props.origin.ready === false && <OverlayWithSpinner />}
            {messageBar}
            <DTAutosuggestPanel
              origin={this.props.origin}
              destination={this.props.destination}
            />
            {
              <div
                className="fullscreen-toggle"
                onClick={this.togglePanelExpanded}
              >
                {!this.state.panelExpanded ? (
                  <Icon img="icon-icon_minimize" className="cursor-pointer" />
                ) : (
                  <Icon img="icon-icon_maximize" className="cursor-pointer" />
                )}
              </div>
            }
          </MapWithTracking>
        </div>
        <div>
          <FrontPagePanelSmall
            selectedPanel={selectedMainTab}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
            panelExpanded={this.state.panelExpanded}
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

const IndexPageWithBreakpoint = getContext({
  breakpoint: PropTypes.string.isRequired,
})(IndexPage);

const Index = shouldUpdate(
  // update only when origin/destination or tab changes
  (props, nextProps) =>
    !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.tab, props.tab)
    ),
)(IndexPageWithBreakpoint);

const IndexPageWithPosition = connectToStores(
  Index,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const newProps = {};

    if (props.params.tab) {
      newProps.tab = props.params.tab;
    }

    // todo extract function:
    if (props.params.from) {
      newProps.origin = parseLocation(props.params.from);

      if (newProps.origin.gps === true) {
        if (locationState.lat && locationState.lon && locationState.address) {
          newProps.origin.ready = true;
          newProps.origin.lat = locationState.lat;
          newProps.origin.lon = locationState.lon;
          newProps.origin.address = locationState.address;
        }
        newProps.origin.gpsError =
          ['no-location', 'prompt', 'searching-location'].indexOf(
            locationState.status,
          ) === -1;
      }
    } else {
      newProps.origin = { set: false };
    }

    if (props.params.to) {
      newProps.destination = parseLocation(props.params.to);
      if (newProps.destination.gps === true) {
        if (locationState.lat && locationState.lon && locationState.address) {
          newProps.destination.lat = locationState.lat;
          newProps.destination.lon = locationState.lon;
          newProps.destination.address = locationState.address;
          newProps.destination.ready = true;
        }
        newProps.destination.gpsError =
          ['no-location', 'prompt', 'searching-location'].indexOf(
            locationState.status,
          ) === -1;
      }
    } else {
      newProps.destination = { set: false };
    }

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
      if (locationState.status === 'searching-location') {
        context.router.replace('/POS/-/lahellasi');
      }
    }
    return newProps;
  },
);

IndexPageWithPosition.contextTypes.router = routerShape.isRequired;
IndexPageWithPosition.contextTypes.executeAction = PropTypes.func.isRequired;
IndexPageWithPosition.contextTypes.location = locationShape.isRequired;

export default IndexPageWithPosition;
