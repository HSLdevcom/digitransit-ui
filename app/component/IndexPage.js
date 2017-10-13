import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { storeEndpoint } from '../action/EndpointActions';
import LazilyLoad, { importLazy } from './LazilyLoad';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import PageFooter from './PageFooter';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import {
  getEndpointPath,
  isEmpty,
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
    executeAction: PropTypes.func.isRequired,
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
      panelExpanded: false, // Show right-now as default
    };
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.config.transportModes.citybike.defaultValue = true;
    }
    // auto select nearby tab if none selected and bp=large
    if (this.props.tab === undefined) {
      this.clickNearby();
    }

    if (this.props.origin !== undefined) {
      if (
        this.props.origin.lon &&
        this.props.origin.lat &&
        !this.props.origin.gps
      ) {
        this.context.executeAction(storeEndpoint, {
          target: 'origin',
          endpoint: this.props.origin,
        });
      } else if (location.set) {
        console.log('TODO gps', location.gps);
      } else {
        console.log('TODO location is not set:', this.props.params.origin);
        // unable to parse origin redirect to front page
      }
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
      return; // we're there already
    }

    if (!isEmpty(nextProps.params.origin)) {
      // origin is set
      this.context.executeAction(storeEndpoint, {
        target: 'origin',
        endpoint: nextProps.origin,
      });
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
          this.props.origin.ready === false && <OverlayWithSpinner />}
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

const IndexPageWithPosition = connectToStores(
  IndexPageWithBreakpoint,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const newProps = {};

    if (props.params.tab) {
      newProps.tab = props.params.tab;
    }

    // todo extract function:
    if (props.params.origin) {
      newProps.origin = parseLocation(props.params.origin);

      if (newProps.origin.gps === true) {
        if (locationState.lat && locationState.lon && locationState.address) {
          newProps.origin.ready = true;
          newProps.origin.lat = locationState.lat;
          newProps.origin.lon = locationState.lon;
          newProps.origin.address = locationState.address;
        }
      }
    } else {
      newProps.origin = { set: false };
    }

    if (props.params.destination) {
      newProps.destination = parseLocation(props.params.destination);
      if (newProps.destination.gps === true) {
        if (locationState.lat && locationState.lon && locationState.address) {
          newProps.destination.lat = locationState.lat;
          newProps.destination.lon = locationState.lon;
          newProps.destination.address = locationState.address;
          newProps.destination.ready = true;
          console.log('destination is position and ready');
        }
      }
    } else {
      newProps.destination = { set: false };
    }

    // automatically use current pos
    if (newProps.destination.set === false && newProps.origin.set === false) {
      if (locationState.status === 'searching-location') {
        context.router.replace('/POS/-/lahellasi');
      }
    }

    return newProps;
  },
);

IndexPageWithPosition.contextTypes.router = routerShape.isRequired;

export default IndexPageWithPosition;
