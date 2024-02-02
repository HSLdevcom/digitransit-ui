import PropTypes from 'prop-types';
import React, { Suspense, lazy } from 'react';

const MenuDrawer = lazy(() => import('./MenuDrawer'));
const MainMenu = lazy(() => import('./MainMenu'));

export default function MainMenuContainer(props) {
  return (
    <Suspense fallback="">
      <MenuDrawer
        open
        onRequestChange={props.closeMenu}
        breakpoint={props.breakpoint}
      >
        <MainMenu
          closeMenu={props.closeMenu}
          homeUrl={props.homeUrl}
          setDisruptionInfoOpen={props.setDisruptionInfoOpen}
        />
      </MenuDrawer>
    </Suspense>
  );
}

MainMenuContainer.propTypes = {
  homeUrl: PropTypes.string.isRequired,
  breakpoint: PropTypes.string,
  setDisruptionInfoOpen: PropTypes.func.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

MainMenuContainer.defaultProps = {
  breakpoint: 'small',
};
