import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import MenuDrawer from './MenuDrawer';
import MainMenu from './MainMenu';

export default function MainMenuContainer({ breakpoint, closeMenu, ...rest }) {
  const intl = useIntl();
  return (
    <MenuDrawer
      open
      onRequestChange={closeMenu}
      breakpoint={breakpoint}
      closeLabel={intl.formatMessage({
        id: 'main-menu-label-close',
        defaultMessage: 'Close the main menu',
      })}
    >
      <MainMenu closeMenu={closeMenu} {...rest} />
    </MenuDrawer>
  );
}

MainMenuContainer.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  closeMenu: PropTypes.func.isRequired,
};
