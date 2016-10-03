import React from 'react';

import { supportsHistory } from 'history/lib/DOMUtils';
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

  onReturnToFrontPage() {
    const timeStore = this.context.getStore('TimeStore');
    if (shouldDisplayPopup(timeStore.getCurrentTime().valueOf())) {
      return this.context.executeAction(FeedbackAction.openFeedbackModal);
    }
    return undefined;
  }

  getSelectedPanel = () => {
    if (typeof window !== 'undefined' && supportsHistory()) {
      const state = this.context.location.state;
      return state && state.selectedPanel;
    }

    return this.state && this.state.selectedPanel;
  }

  selectPanel = (selection) => {
    let tabOpensOrCloses;
    let newSelection;
    const oldSelection = this.getSelectedPanel();

    if (selection === oldSelection) {
      this.onReturnToFrontPage();
    } else {
      newSelection = selection;
    }

    if (supportsHistory()) {
      tabOpensOrCloses = !oldSelection || !newSelection;

      if (tabOpensOrCloses) {
        return this.context.router.push({
          state: {
            selectedPanel: newSelection,
          },
          query: this.context.location.query,
          pathname: this.context.location.pathname,
        });
      }
      return this.context.router.replace({
        state: {
          selectedPanel: newSelection,
        },
        query: this.context.location.query,
        pathname: this.context.location.pathname,
      });
    }
    return this.setState({
      selectedPanel: newSelection,
    });
  }

  closePanel = () => this.selectPanel(this.getSelectedPanel())


  clickNearby = () => {
    console.log('click nearby', this.getSelectedPanel());
    if (this.props.breakpoint === 'medium') {
      if (this.context.piwik) {
        const action = this.getSelectedPanel() === 1 ? 'close' : 'open';
        this.context.piwik.trackEvent('Front page tabs', 'Nearby', action);
      }
      this.selectPanel(1);
      return;
    }

    if (this.getSelectedPanel() !== 1) {
      const action = 'open';
      this.context.piwik.trackEvent('Front page tabs', 'Nearby', action);
      this.selectPanel(1);
    }
  };

  clickFavourites = () => {
    console.log('click favourites', this.getSelectedPanel());
    if (this.props.breakpoint === 'medium') {
      if (this.context.piwik) {
        const action = this.getSelectedPanel() === 2 ? 'close' : 'open';
        this.context.piwik.trackEvent('Front page tabs', 'Favourites', action);
        this.selectPanel(2);
        return;
      }
    }

    if (this.getSelectedPanel() !== 2) {
      const action = 'open';
      this.context.piwik.trackEvent('Front page tabs', 'Favourites', action);
      this.selectPanel(2);
    }
  };

  render() {
    return (this.props.breakpoint !== 'large' && // small, medium
      <FrontPagePanel
        selectedPanel={this.getSelectedPanel()}
        nearbyClicked={this.clickNearby}
        favouritesClicked={this.clickFavourites}
        closePanel={this.closePanel}
      />
    ) || <FrontPagePanelLarge
      selectedPanel={this.getSelectedPanel()}
      nearbyClicked={this.clickNearby}
      favouritesClicked={this.clickFavourites}
    />;
  }
}
