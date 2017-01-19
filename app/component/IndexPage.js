import React from 'react';
import getContext from 'recompose/getContext';
import { clearDestination } from '../action/EndpointActions';
import LazilyLoad, { importLazy } from './LazilyLoad';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import SearchMainContainer from './SearchMainContainer';
import PageFooter from './PageFooter';

const feedbackPanelMudules = { Panel: () => importLazy(System.import('./FeedbackPanel')) };

const feedbackPanel = (
  <LazilyLoad modules={feedbackPanelMudules} >
    {({ Panel }) => <Panel />}
  </LazilyLoad>
);

const messageBarModules = { Bar: () => importLazy(System.import('./MessageBar')) };

const messageBar = (
  <LazilyLoad modules={messageBarModules} >
    {({ Bar }) => <Bar />}
  </LazilyLoad>
);

class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: React.PropTypes.string.isRequired,
    content: React.PropTypes.node,
    routes: React.PropTypes.array,
  }

  componentWillMount = () => {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      this.context.config.transportModes.citybike.defaultValue = true;
    }

    // auto select nearby tab if none selected and bp=large
    if (this.props.breakpoint === 'large' &&
      this.getSelectedTab() === undefined) {
      this.clickNearby();
    }
  }

  componentWillReceiveProps = (nextProps) => {
    const frombp = this.props.breakpoint;
    const tobp = nextProps.breakpoint;

    if (frombp === tobp) {
      return;
    }

    // auto close any tab on bp change from large
    if (this.getSelectedTab() !== undefined && frombp === 'large') {
      this.closeTab();
    } else if (this.getSelectedTab() === undefined && tobp === 'large') {
      // auto open nearby tab on bp change to large
      this.clickNearby();
    }
  }

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
  }

  resetToCleanState = () => {
    this.context.executeAction(clearDestination);
  }

  trackEvent = (...args) => {
    if (typeof this.context.piwik === 'function') {
      this.context.piwik(...args);
    }
  }

  clickNearby = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      if (this.getSelectedTab() === 1) {
        this.closeTab();
      } else {
        this.openNearby();
      }
      this.trackEvent('Front page tabs', 'Nearby',
        this.getSelectedTab() === 1 ? 'close' : 'open');
    } else {
      this.openNearby();
      this.trackEvent('Front page tabs', 'Nearby', 'open');
    }
  };

  clickFavourites = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      if (this.getSelectedTab() === 2) {
        this.closeTab();
      } else {
        this.openFavourites();
      }
      this.trackEvent('Front page tabs', 'Favourites',
        this.getSelectedTab() === 1 ? 'close' : 'open');
    } else {
      this.openFavourites();
      this.trackEvent('Front page tabs', 'Nearby', 'open');
    }
  };

  replace = (path) => {
    if (this.context.router) {
      this.context.router.replace(path);
    }
  }

  openFavourites = () => {
    this.replace('/suosikit');
  }

  openNearby = () => {
    this.replace('/lahellasi');
  }

  closeTab = () => {
    this.replace('/');
  }

  render() {
    const selectedTab = this.getSelectedTab();
    return (this.props.breakpoint === 'large' ? (
      <div className={`front-page flex-vertical fullscreen bp-${this.props.breakpoint}`} >
        {messageBar}
        <MapWithTracking
          breakpoint={this.props.breakpoint} showStops showScaleBar tab={selectedTab}
        >
          <SearchMainContainer />
          <div key="foo" className="fpccontainer">
            <FrontPagePanelLarge
              selectedPanel={selectedTab}
              nearbyClicked={this.clickNearby}
              favouritesClicked={this.clickFavourites}
            >{this.props.content}</FrontPagePanelLarge>
          </div>
        </MapWithTracking>
        <div id="page-footer-container">
          <PageFooter
            content={(this.context.config.footer && this.context.config.footer.content) || []}
          />
        </div>
        {feedbackPanel}
      </div>
    ) : (
      <div className={`front-page flex-vertical fullscreen bp-${this.props.breakpoint}`} >
        <div className="flex-grow map-container">
          <MapWithTracking breakpoint={this.props.breakpoint} showStops showScaleBar>
            {messageBar}
            <SearchMainContainer />
          </MapWithTracking>
        </div>
        <div>
          <FrontPagePanelSmall
            selectedPanel={this.getSelectedTab()}
            nearbyClicked={this.clickNearby}
            favouritesClicked={this.clickFavourites}
            closePanel={this.closeTab}
          >{this.props.content}</FrontPagePanelSmall>
          {feedbackPanel}
        </div>
      </div>
    ));
  }
}

const IndexPageWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(IndexPage);

export default IndexPageWithBreakpoint;
