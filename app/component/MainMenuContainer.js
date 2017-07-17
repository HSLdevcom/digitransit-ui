import React, { Component, PropTypes } from 'react';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import { openFeedbackModal } from '../action/feedbackActions';
import LazilyLoad, { importLazy } from './LazilyLoad';


class MainMenuContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    piwik: PropTypes.object,
    router: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  onRequestChange = newState => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (this.context.location.state != null &&
        this.context.location.state.offcanvasVisible != null) {
      return this.context.location.state.offcanvasVisible;
    }
    // If the state is missing or doesn't have offcanvasVisible, it's not set
    return false;
  }

  toggleOffcanvas = () => this.internalSetOffcanvas(!this.getOffcanvasState());

  internalSetOffcanvas = (newState) => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent('Offcanvas', 'Index', newState ? 'open' : 'close');
    }

    if (newState) {
      this.context.router.push({
        ...this.context.location,
        state: {
          ...this.context.location.state,
          offcanvasVisible: newState,
        },
      });
    } else {
      this.context.router.goBack();
    }
  }

  openFeedback = () => {
    this.context.executeAction(openFeedbackModal);
    this.toggleOffcanvas();
  }

  mainMenuModules = {
    Drawer: () => importLazy(System.import('material-ui/Drawer')),
    MainMenu: () => importLazy(System.import('./MainMenu')),
  }

  render() {
    return (
      <div>
        <LazilyLoad modules={this.mainMenuModules}>
          {({ Drawer, MainMenu }) => (
            <Drawer
              className="offcanvas"
              disableSwipeToOpen
              docked={false}
              open={this.getOffcanvasState()}
              openSecondary
              onRequestChange={this.onRequestChange}
            >
              <MainMenu
                openFeedback={this.openFeedback}
                toggleVisibility={this.toggleOffcanvas}
                showDisruptionInfo={this.getOffcanvasState()}
                visible={this.getOffcanvasState()}
              />
            </Drawer>
          )}
        </LazilyLoad>
        {this.context.config.mainMenu.show ? (
          <div className="icon-holder cursor-pointer main-menu-toggle">
            <button
              aria-label={this.context.intl.formatMessage({
                id: 'main-menu-label-open',
                defaultMessage: 'Open the main menu',
              })}
              onClick={this.toggleOffcanvas}
              className="noborder cursor-pointer"
            >
              <Icon img={'icon-icon_menu'} className="icon" />
            </button>
          </div>
        ) : null}
      </div>);
  }
}

export default MainMenuContainer;
