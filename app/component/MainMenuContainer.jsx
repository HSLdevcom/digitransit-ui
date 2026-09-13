import PropTypes from 'prop-types';
import React from 'react';
import MenuDrawer from './MenuDrawer.jsx';
import MainMenu from './MainMenu.jsx';

export default function MainMenuContainer({ breakpoint, closeMenu, ...rest }) {
  return (
    <MenuDrawer open onRequestChange={closeMenu} breakpoint={breakpoint}>
      <MainMenu closeMenu={closeMenu} {...rest} />
    </MenuDrawer>
  );
}

MainMenuContainer.propTypes = {
  breakpoint: PropTypes.string,
  closeMenu: PropTypes.func.isRequired,
};

MainMenuContainer.defaultProps = {
  breakpoint: 'small',
};
