import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';

const AppBarContainer = ({ breakpoint, router, location, homeUrl, ...args }) =>
  (breakpoint !== 'large' && (
    <AppBarSmall
      {...args}
      showLogo={location.pathname.indexOf(homeUrl) === 0}
      homeUrl={homeUrl}
    />
  )) || <AppBarLarge {...args} titleClicked={() => router.push(homeUrl)} />;

const WithContext = getContext({
  location: locationShape.isRequired,
  router: routerShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
})(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
