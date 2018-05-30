import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import { DesktopOrMobile } from '../util/withBreakpoint';

const AppBarContainer = ({ router, location, homeUrl, ...args }) => (
  <DesktopOrMobile
    mobile={() => (
      <AppBarSmall
        {...args}
        showLogo={location.pathname.indexOf(homeUrl) === 0}
        homeUrl={homeUrl}
      />
    )}
    desktop={() => (
      <AppBarLarge {...args} titleClicked={() => router.push(homeUrl)} />
    )}
  />
);

AppBarContainer.propTypes = {
  location: locationShape.isRequired,
  router: routerShape.isRequired,
  homeUrl: PropTypes.string.isRequired,
};

const WithContext = getContext({
  location: locationShape.isRequired,
  router: routerShape.isRequired,
})(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
