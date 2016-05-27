import React from 'react';
import Icon from '../icon/icon';
import cx from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FavouritesPanel from '../favourites/favourites-panel';
import NearbyRoutesPanel from './NearbyRoutesPanel';
import FavouritesTabLabelContainer from './FavouritesTabLabelContainer';
import NearbyTabLabelContainer from './NearbyTabLabelContainer';

import { supportsHistory } from 'history/lib/DOMUtils';

import Feedback from '../../util/feedback';
import FeedbackAction from '../../action/feedback-action';
import intl from 'react-intl';
const { FormattedMessage } = intl;

import { startMeasuring, stopMeasuring } from '../../util/jankmeter';

export default class FrontPagePanel extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    piwik: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  };

  constructor(args) {
    super(...args);
    this.getSelectedPanel = this.getSelectedPanel.bind(this);
    this.selectPanel = this.selectPanel.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.stopMeasuring = this.stopMeasuring.bind(this);
  }

  onReturnToFrontPage() {
    const timeStore = this.context.getStore('TimeStore');
    if (Feedback.shouldDisplayPopup(timeStore.getCurrentTime().valueOf())) {
      return this.context.executeAction(FeedbackAction.openFeedbackModal);
    }
    return undefined;
  }

  getSelectedPanel() {
    if (typeof window !== 'undefined' && supportsHistory()) {
      const state = this.context.location.state;
      return state && state.selectedPanel;
    }

    return this.state && this.state.selectedPanel;
  }

  selectPanel(selection) {
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

          pathname: this.context.location.pathname,
        });
      }
      return this.context.router.replace({
        state: {
          selectedPanel: newSelection,
        },
        pathname: this.context.location.pathname,
      });
    }
    return this.setState({
      selectedPanel: newSelection,
    });
  }

  closePanel() {
    return this.selectPanel(this.getSelectedPanel());
  }

  startMeasuring() {
    return startMeasuring();
  }

  stopMeasuring() {
    const piwik = this.context.piwik;
    const results = stopMeasuring();

    if (piwik && results) {
      // Piwik doesn't show event values, if they are too long, so we must round... >_<
      piwik.trackEvent('perf', 'nearby-panel-drag', 'min', Math.round(results.min));
      piwik.trackEvent('perf', 'nearby-panel-drag', 'max', Math.round(results.max));
      piwik.trackEvent('perf', 'nearby-panel-drag', 'avg', Math.round(results.avg));
    }
  }

  render() {
    let heading;
    let panel;
    const tabClasses = ['small-6', 'h4', 'hover'];
    const nearbyClasses = ['nearby-routes'];
    const favouritesClasses = ['favourites'];

    if (this.getSelectedPanel() === 1) {
      panel = <NearbyRoutesPanel />;
      heading = <FormattedMessage id="near-you" defaultMessage="Near you" />;
      nearbyClasses.push('selected');
    } else if (this.getSelectedPanel() === 2) {
      panel = <FavouritesPanel />;
      heading = <FormattedMessage id="your-favourites" defaultMessage="Your favourites" />;
      favouritesClasses.push('selected');
    }

    const top = (
      <div className="panel-top">
        <div className="panel-heading">
          <h2>{heading}</h2>
        </div>
        <div className="close-icon" onClick={this.closePanel}>
          <Icon img="icon-icon_close" />
        </div>
      </div>
    );

    const content = <div className="frontpage-panel-wrapper" key="panel">{top}{panel}</div>;

    const piwik = this.context.piwik;

    const clickNearby = () => {
      if (piwik) {
        const action = this.getSelectedPanel() === 1 ? 'close' : 'open';
        piwik.trackEvent('Front page tabs', 'Nearby', action);
      }
      return this.selectPanel(1);
    };

    const clickFavourites = () => {
      if (piwik) {
        const action = this.getSelectedPanel() === 2 ? 'close' : 'open';
        piwik.trackEvent('Front page tabs', 'Favourites', action);
      }
      return this.selectPanel(2);
    };

    return (
      <div className="frontpage-panel-container no-select">
        <ReactCSSTransitionGroup
          transitionName="frontpage-panel-wrapper"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
        >
        {this.getSelectedPanel() ? content : undefined}
        </ReactCSSTransitionGroup>
        <ul className="tabs-row tabs-arrow-up cursor-pointer">
          <NearbyTabLabelContainer
            classes={cx(tabClasses, nearbyClasses)}
            onClick={clickNearby}
          />
          <FavouritesTabLabelContainer
            classes={cx(tabClasses, favouritesClasses)}
            onClick={clickFavourites}
          />
        </ul>
      </div>
    );
  }
}
