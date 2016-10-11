import React from 'react';

import { intlShape } from 'react-intl';

import { shouldDisplayPopup } from '../../util/Feedback';
import FeedbackAction from '../../action/feedback-action';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import FrontPagePanel from './FrontPagePanel';
import FrontPagePanelLarge from './FrontPagePanelLarge';

export default class FrontPagePanelContainer extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    breakpoint: React.PropTypes.string,
    className: React.PropTypes.string,
    children: React.PropTypes.node,
    routes: React.PropTypes.array,
    floating: React.PropTypes.bool,
    autoNavigateToNearby: React.PropTypes.bool,
  }

  static defaultProps = {
    breakpoint: 'medium',
    floating: true,
    autoNavigateToNearby: true,
  }

  static description = () => (
    <div>
      <p>
        Visual search component that acts as a link to search dialog.
      </p>
      <ComponentUsageExample description="Front page tabs">
        <FrontPagePanelContainer />
      </ComponentUsageExample>
      <ComponentUsageExample description="Large front page tabs">
        <FrontPagePanelContainer breakpoint="large" floating="no" autoNavigateToNearby={false} />
      </ComponentUsageExample>
    </div>);

  componentDidMount() {
      // auto select nearby tab if none selected and bp=large
    if (this.props.autoNavigateToNearby === true && this.props.breakpoint === 'large' &&
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
      return this.context.executeAction(FeedbackAction.openFeedbackModal);
    }
    return undefined;
  }

  getSelectedTab = () => {
    if (this.props.routes && this.props.routes.length > 0) {
      const routePath = this.props.routes[this.props.routes.length - 1].path;

      if (routePath === 'suosikit') {
        return 2;
      } else if (routePath === 'lahellasi') {
        return 1;
      }
    }

    return undefined;
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
    return (this.props.breakpoint !== 'large' && // small, medium
      <FrontPagePanel
        selectedPanel={this.getSelectedTab()}
        nearbyClicked={this.clickNearby}
        favouritesClicked={this.clickFavourites}
        closePanel={this.closeTab}
      >{this.props.children}</FrontPagePanel>
    ) || <FrontPagePanelLarge
      floating={this.props.floating}
      selectedPanel={this.getSelectedTab()}
      nearbyClicked={this.clickNearby}
      favouritesClicked={this.clickFavourites}
    >{this.props.children}</FrontPagePanelLarge>;
  }
}
