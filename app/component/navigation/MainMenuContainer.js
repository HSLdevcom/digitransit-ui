import React, { Component, PropTypes } from 'react';
import config from '../../config';
import Icon from '../icon/icon';
import MainMenu from './MainMenu';
import Drawer from 'material-ui/Drawer';
import FeedbackActions from '../../action/feedback-action';

import { supportsHistory } from 'history/lib/DOMUtils';

class MainMenuContainer extends Component {
  static propTypes = {
    showDisruptionInfo: PropTypes.bool,
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    piwik: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = { offcanvasVisible: false };
  }

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
            (this.context.location.search != null ?
              this.context.location.search.indexOf('mock') : void 0) > -1 ? '?mock' : ''),
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
            showDisruptionInfo={this.props.showDisruptionInfo}
            toggleVisibility={this.toggleOffcanvas}
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
