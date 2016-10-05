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
    history: React.PropTypes.object,
  }

  static defaultProps = {
    breakpoint: 'medium',
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
        <FrontPagePanelContainer breakpoint="large" />
      </ComponentUsageExample>
    </div>);

// TODO hook this function
  onReturnToFrontPage() {
    const timeStore = this.context.getStore('TimeStore');
    if (shouldDisplayPopup(timeStore.getCurrentTime().valueOf())) {
      return this.context.executeAction(FeedbackAction.openFeedbackModal);
    }
    return undefined;
  }

  getSelectedTab() {
    const routePath = this.props.routes[this.props.routes.length - 1].path;

    if (routePath === 'suosikit') {
      return 2;
    } else if (routePath === 'lahellasi') {
      return 1;
    } return undefined;
  }

  trackEvent = (...args) => {
    if (this.context.piwik) {
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

  openFavourites() {
    this.props.history.replace('/suosikit');
  }

  openNearby() {
    this.props.history.replace('/lahellasi');
  }

  closeTab() {
    this.props.history.replace('/');
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
      selectedPanel={this.getSelectedTab()}
      nearbyClicked={this.clickNearby}
      favouritesClicked={this.clickFavourites}
    >{this.props.children}</FrontPagePanelLarge>;
  }
}
