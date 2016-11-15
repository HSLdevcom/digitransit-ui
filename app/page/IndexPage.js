import React from 'react';
import getContext from 'recompose/getContext';
import { clearDestination } from '../action/EndpointActions';
import FeedbackPanel from '../component/feedback/FeedbackPanel';
import FrontPagePanelLarge from '../component/front-page/FrontPagePanelLarge';
import FrontPagePanelSmall from '../component/front-page/FrontPagePanelSmall';
import MapWithTracking from '../component/map/MapWithTracking';
import SearchMainContainer from '../component/search/SearchMainContainer';
import config from '../config';
import MessageBar from '../component/navigation/MessageBar';
import { shouldDisplayPopup } from '../util/Feedback';
import { openFeedbackModal } from '../action/feedbackActions';
import FavouritesPanel from '../component/favourites/FavouritesPanel';
import NearbyRoutesPanel from '../component/front-page/NearbyRoutesPanel';

class IndexPage extends React.Component {
  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: React.PropTypes.string.isRequired,
    children: React.PropTypes.node,
    routes: React.PropTypes.array,
  }

  componentWillMount = () => {
    this.resetToCleanState();
  }

  componentDidMount() {
    const search = this.context.location.search;

    if (search && search.indexOf('citybikes') >= -1) {
      config.transportModes.citybike.defaultValue = true;
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

  // TODO hook this function
  onReturnToFrontPage() {
    const timeStore = this.context.getStore('TimeStore');
    if (shouldDisplayPopup(timeStore.getCurrentTime().valueOf())) {
      return this.context.executeAction(openFeedbackModal);
    }
    return undefined;
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
    const content = selectedTab === 1 ? <NearbyRoutesPanel /> : <FavouritesPanel />;
    return (this.props.breakpoint === 'large' ? (
      <div className={`front-page flex-vertical fullscreen bp-${this.props.breakpoint}`} >
        <MessageBar />
        <MapWithTracking breakpoint={this.props.breakpoint} showStops tab={selectedTab}>
          <SearchMainContainer />
          <div key="foo" className="fpccontainer">
            <FrontPagePanelLarge
              selectedPanel={selectedTab}
              nearbyClicked={this.clickNearby}
              favouritesClicked={this.clickFavourites}
            >{content}</FrontPagePanelLarge>
          </div>
        </MapWithTracking>
        <FeedbackPanel />
      </div>
    ) : (
    <div className={`front-page flex-vertical fullscreen bp-${this.props.breakpoint}`} >
      <div className="flex-grow map-container">
        <MapWithTracking breakpoint={this.props.breakpoint} showStops >
          <MessageBar />
          <SearchMainContainer />
        </MapWithTracking>
      </div>
      <div>
        <FrontPagePanelSmall
          selectedPanel={this.getSelectedTab()}
          nearbyClicked={this.clickNearby}
          favouritesClicked={this.clickFavourites}
          closePanel={this.closeTab}
        >{content}</FrontPagePanelSmall>
        <FeedbackPanel />
      </div>
    </div>
    ));
  }
}

const IndexPageWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(IndexPage);

export default IndexPageWithBreakpoint;
