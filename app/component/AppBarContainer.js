import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';

const AppBarContainer = ({ breakpoint, router, location, ...args }) =>
  // TODO fix show logo
  (breakpoint !== 'large' &&
    <AppBarSmall {...args} showLogo={router.isActive('/')} />) ||
  <AppBarLarge {...args} titleClicked={() => router.push('/lahellasi')} />;

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
