import React from 'react';
import { routerShape, locationShape } from 'react-router';
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
    location: locationShape.isRequired,
    router: routerShape.isRequired,
    piwik: React.PropTypes.object,
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
    if (typeof this.context.piwik === 'object') {
      this.context.piwik.trackEvent(...args);
    }
  }

  clickNearby = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      const selected = this.getSelectedTab();
      if (selected === 1) {
        this.closeTab();
      } else {
        this.openNearby(selected === 2);
      }
      this.trackEvent('Front page tabs', 'Nearby', selected === 1 ? 'close' : 'open');
    } else {
      this.openNearby(true);
      this.trackEvent('Front page tabs', 'Nearby', 'open');
    }
  };

  clickFavourites = () => {
    // tab click logic is different in large vs the rest!
    if (this.props.breakpoint !== 'large') {
      const selected = this.getSelectedTab();
      if (selected === 2) {
        this.closeTab();
      } else {
        this.openFavourites(selected === 1);
      }
      this.trackEvent('Front page tabs', 'Favourites', selected === 2 ? 'close' : 'open');
    } else {
      this.openFavourites(true);
      this.trackEvent('Front page tabs', 'Favourites', 'open');
    }
  };

  openFavourites = (replace) => {
    if (replace) {
      this.context.router.replace('/suosikit');
    } else {
      this.context.router.push('/suosikit');
    }
  }

  openNearby = (replace) => {
    if (replace) {
      this.context.router.replace('/lahellasi');
    } else {
      this.context.router.push('/lahellasi');
    }
  }

  // used only in mobile with fullscreen tabs
  closeTab = () => {
    if (this.context.location && this.context.location.action === 'PUSH') {
      // entered the tab from the index page, not by a direct url
      this.context.router.goBack();
    } else {
      this.context.router.replace('/');
    }
  }

  render() {
    const selectedMainTab = this.getSelectedTab();
    const selectedSearchTab = this.context.location.state &&
          this.context.location.state.selectedTab ?
          this.context.location.state.selectedTab : 'destination';
    const searchModalIsOpen = this.context.location.state ?
          Boolean(this.context.location.state.searchModalIsOpen) : false;
    return (this.props.breakpoint === 'large' ? (
      <div className={`front-page flex-vertical fullscreen bp-${this.props.breakpoint}`} >
        {messageBar}
        <MapWithTracking
          breakpoint={this.props.breakpoint}
          showStops
          showScaleBar
          searchModalIsOpen={searchModalIsOpen}
          selectedTab={selectedSearchTab}
          tab={selectedMainTab}
        >
          <SearchMainContainer
            searchModalIsOpen={searchModalIsOpen}
            selectedTab={selectedSearchTab}
          />
          <div key="foo" className="fpccontainer">
            <FrontPagePanelLarge
              selectedPanel={selectedMainTab}
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
          <MapWithTracking
            breakpoint={this.props.breakpoint}
            showStops
            showScaleBar
            searchModalIsOpen={searchModalIsOpen}
            selectedTab={selectedSearchTab}
          >
            {messageBar}
            <SearchMainContainer
              searchModalIsOpen={searchModalIsOpen}
              selectedTab={selectedSearchTab}
            />
          </MapWithTracking>
        </div>
        <div>
          <FrontPagePanelSmall
            selectedPanel={selectedMainTab}
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
