import PropTypes from 'prop-types';
import React, { Component } from 'react';

import LazilyLoad, { importLazy } from './LazilyLoad';

class MainMenuContainer extends Component {
  static propTypes = {
    homeUrl: PropTypes.string.isRequired,
    breakpoint: PropTypes.string,
    setDisruptionInfoOpen: PropTypes.func.isRequired,
    closeMenu: PropTypes.func.isRequired,
  };

  static defaultProps = {
    breakpoint: 'small',
  };

  mainMenuModules = {
    MenuDrawer: () => importLazy(import('./MenuDrawer')),
    MainMenu: () => importLazy(import('./MainMenu')),
  };

  render = () => {
    return (
      <>
        <LazilyLoad modules={this.mainMenuModules}>
          {({ MenuDrawer, MainMenu }) => (
            <MenuDrawer
              open
              onRequestChange={this.props.closeMenu}
              breakpoint={this.props.breakpoint}
            >
              <MainMenu
                closeMenu={this.props.closeMenu}
                homeUrl={this.props.homeUrl}
                setDisruptionInfoOpen={this.props.setDisruptionInfoOpen}
              />
            </MenuDrawer>
          )}
        </LazilyLoad>
      </>
    );
  };
}

export default MainMenuContainer;
