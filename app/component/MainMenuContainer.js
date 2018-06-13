import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import Icon from './Icon';
import LazilyLoad, { importLazy } from './LazilyLoad';

class MainMenuContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    piwik: PropTypes.object,
    router: routerShape.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    homeUrl: PropTypes.string.isRequired,
  };

  onRequestChange = newState => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (
      this.context.location.state != null &&
      this.context.location.state.offcanvasVisible != null
    ) {
      return this.context.location.state.offcanvasVisible;
    }
    // If the state is missing or doesn't have offcanvasVisible, it's not set
    return false;
  };

  toggleOffcanvas = () => this.internalSetOffcanvas(!this.getOffcanvasState());

  internalSetOffcanvas = newState => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Offcanvas',
        'Index',
        newState ? 'open' : 'close',
      );
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
  };

  mainMenuModules = {
    Drawer: () => importLazy(import('material-ui/Drawer')),
    MainMenu: () => importLazy(import('./MainMenu')),
  };

  render = () => (
    <React.Fragment>
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
              toggleVisibility={this.toggleOffcanvas}
              showDisruptionInfo={this.getOffcanvasState()}
              visible={this.getOffcanvasState()}
              homeUrl={this.props.homeUrl}
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
            <Icon img="icon-icon_menu" className="icon" />
          </button>
        </div>
      ) : null}
    </React.Fragment>
  );
}

export default MainMenuContainer;
