import PropTypes from 'prop-types';
import React, { Suspense, lazy } from 'react';

const MenuDrawer = lazy(() => import('./MenuDrawer'));
const MainMenu = lazy(() => import('./MainMenu'));

export default function MainMenuContainer({ breakpoint, closeMenu, ...rest }) {
  return (
    <Suspense fallback="">
      <MenuDrawer open onRequestChange={closeMenu} breakpoint={breakpoint}>
        <MainMenu {...rest} />
      </MenuDrawer>
    </Suspense>
  );
}

MainMenuContainer.propTypes = {
  breakpoint: PropTypes.string,
  closeMenu: PropTypes.func.isRequired,
};

MainMenuContainer.defaultProps = {
  breakpoint: 'small',
};
