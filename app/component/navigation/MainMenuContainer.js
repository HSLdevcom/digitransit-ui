import React, { Component, PropTypes } from 'react';
import Drawer from 'material-ui/Drawer';
import { supportsHistory } from 'history/lib/DOMUtils';

import config from '../../config';
import Icon from '../icon/icon';
import MainMenu from './MainMenu';
import FeedbackActions from '../../action/feedback-action';

class MainMenuContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    piwik: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = { offcanvasVisible: false };

  onRequestChange = (newState) => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (typeof window !== 'undefined' && supportsHistory()) {
      if (this.context.location.state != null &&
          this.context.location.state.offcanvasVisible != null) {
        return this.context.location.state.offcanvasVisible;
      }
      // If the state is missing or doesn't have offcanvasVisible, it's not set
      return false;
    }
    // Use state only if we can't use the state in history API
    return this.state.offcanvasVisible;
  }

  toggleOffcanvas = () => this.internalSetOffcanvas(!this.getOffcanvasState());

  internalSetOffcanvas = (newState) => {
    this.setState({ offcanvasVisible: newState });

    if (this.context.piwik != null) {
      this.context.piwik.trackEvent('Offcanvas', 'Index', newState ? 'open' : 'close');
    }

    if (supportsHistory()) {
      if (newState) {
        this.context.router.push({
          state: { offcanvasVisible: newState },
          pathname: this.context.location.pathname + (
            (this.context.location.search && this.context.location.search.indexOf('mock') > -1) ?
              '?mock' : ''),
        });
      } else {
        this.context.router.goBack();
      }
    }
  }

  openFeedback = () => {
    this.context.executeAction(FeedbackActions.openFeedbackModal);
    this.toggleOffcanvas();
  }

  render() {
    return (
      <div>
        <Drawer
          className="offcanvas"
          disableSwipeToOpen
          ref="leftNav"
          docked={false}
          open={this.getOffcanvasState()}
          openSecondary
          onRequestChange={this.onRequestChange}
        >
          <MainMenu
            openFeedback={this.openFeedback}
            toggleVisibility={this.toggleOffcanvas}
            showDisruptionInfo={this.getOffcanvasState()}
          />
        </Drawer>
        {config.mainMenu.show ?
          <div
            onClick={this.toggleOffcanvas}
            className="icon-holder cursor-pointer main-menu-toggle"
          >
            <Icon img={'icon-icon_menu'} className="icon" />
          </div> :
          null}
      </div>);
  }
}

export default MainMenuContainer;
