import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class MainMenuContainer extends Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    homeUrl: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    user: PropTypes.object,
  };

  static defaultProps = {
    isOpen: false,
  };

  mainMenuModules = {
    MenuDrawer: () => importLazy(import('./MenuDrawer')),
    MainMenu: () => importLazy(import('./MainMenu')),
  };

  onRequestChange = newState => this.internalSetOffcanvas(newState);

  getOffcanvasState = () => {
    if (
      this.context.match.location.state != null &&
      this.context.match.location.state.offcanvasVisible != null
    ) {
      return this.context.match.location.state.offcanvasVisible;
    }
    // If the state is missing or doesn't have offcanvasVisible, it's not set
    return false;
  };

  toggleOffcanvas = () => this.internalSetOffcanvas(!this.getOffcanvasState());

  internalSetOffcanvas = newState => {
    addAnalyticsEvent({
      category: 'Navigation',
      action: newState ? 'OpenMobileMenu' : 'CloseMobileMenu',
      name: null,
    });

    if (newState) {
      this.context.router.push({
        ...this.context.match.location,
        state: {
          ...this.context.match.location.state,
          offcanvasVisible: newState,
        },
      });
    } else {
      this.context.router.go(-1);
    }
  };

  render = () => {
    const isOpen = this.getOffcanvasState() || this.props.isOpen;
    const isForcedOpen = this.props.isOpen;
    return (
      <React.Fragment>
        <LazilyLoad modules={this.mainMenuModules}>
          {({ MenuDrawer, MainMenu }) => (
            <MenuDrawer
              className="offcanvas"
              disableSwipeToOpen
              docked={false}
              open={isOpen}
              openSecondary
              onRequestChange={this.onRequestChange}
              style={{ position: 'absolute' }}
            >
              <MainMenu
                toggleVisibility={this.toggleOffcanvas}
                showDisruptionInfo={isOpen && !isForcedOpen}
                visible={isOpen}
                homeUrl={this.props.homeUrl}
                user={this.props.user}
              />
            </MenuDrawer>
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
  };
}

MainMenuContainer.description = (
  <ComponentUsageExample isFullscreen>
    <MainMenuContainer homeUrl="" isOpen />
  </ComponentUsageExample>
);

export default MainMenuContainer;
