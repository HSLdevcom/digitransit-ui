import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import { storeEndpoint, clearDestination } from '../action/EndpointActions';
import LazilyLoad, { importLazy } from './LazilyLoad';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import PageFooter from './PageFooter';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { otpToLocation } from '../util/otpStrings';
import { getEndpointPath, isEmpty, parseLocation } from '../util/path';
import Icon from './Icon';

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
    content: PropTypes.node,
    routes: PropTypes.array,
    params: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      panelExpanded: false, // Show right-now as default
    };
  }

  componentWillMount = () => {
    this.resetToCleanState();
  };

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.config.transportModes.citybike.defaultValue = true;
    }
    // auto select nearby tab if none selected and bp=large
    if (this.getSelectedTab() === undefined) {
      this.clickNearby();
    }
    if (this.props.params.origin !== undefined) {
      const location = parseLocation(this.props.params.origin);
      if (location.lon && location.lat) {
        this.context.executeAction(storeEndpoint, {
          target: 'origin',
          endpoint: location,
        });
      } else if (location.set) {
        console.log('gps', location.gps);
      } else {
        console.log('could not parse params.origin:', this.props.params.origin);
        // unable to parse origin redirect to front page
      }
    }
  }

  componentWillReceiveProps = nextProps => {
    this.handleBreakpointProps(nextProps);
    this.handleOriginProps(nextProps);
  };

  getOrigin = () => {
    if (this.props.params.origin) {
      const location = parseLocation(this.props.params.origin);
      if (location.set) {
        return location;
      }
    }
    return undefined;
  };

  getDestination = () => {
    if (this.props.params.destination) {
      const location = parseLocation(this.props.params.destination);
      if (location.set) {
        return location;
      }
    }
    return undefined;
  };

  getSelectedTab = (props = this.props) => {
    if (props.routes && props.routes.length > 0) {
      const routePath = props.routes[props.routes.length - 1].path;

      if (routePath === 'suosikit') {
        return 2;
      } else if (routePath === 'lahellasi') {
        return 1;
      }
    }

    return undefined;
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
    const fromOrigin = this.props.params.origin;
    const toOrigin = nextProps.params.origin;

    if (fromOrigin === toOrigin) {
      return; // we're there already
    }

    if (!isEmpty(nextProps.params.origin)) {
      // origin is set
      const location = otpToLocation(nextProps.params.origin);

      this.context.executeAction(storeEndpoint, {
        target: 'origin',
        endpoint: location,
      });
      // this.resetToCleanState();
    }
  };

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
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
        >
          <DTAutosuggestPanel
            origin={this.getOrigin()}
            destination={this.getDestination()}
          />
          <div key="foo" className="fpccontainer">
            <FrontPagePanelLarge
              selectedPanel={selectedMainTab}
              nearbyClicked={this.clickNearby}
              favouritesClicked={this.clickFavourites}
            >
              {this.props.content}
            </FrontPagePanelLarge>
          </div>
        </MapWithTracking>
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
            showScaleBar
          >
            {messageBar}
            <DTAutosuggestPanel
              origin={this.getOrigin()}
              destination={this.getDestination()}
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
            }}
          </MapWithTracking>
        </div>
        <div>
          <FrontPagePanelSmall
            selectedPanel={selectedMainTab}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
            closePanel={this.closeTab}
            panelExpanded={this.state.panelExpanded}
          >
            {this.props.content}
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

export default IndexPageWithBreakpoint;
