import React, { PropTypes } from 'react';
import { routerShape } from 'react-router';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';


const AppBarContainer = ({ breakpoint, router, ...args }) => (
  (breakpoint !== 'large' &&
    <AppBarSmall {...args} showLogo={router.isActive('/')} />) || <AppBarLarge
      {...args} titleClicked={() => router.push('/lahellasi')}
    />);

const WithContext = getContext({ router: routerShape.isRequired,
  breakpoint: React.PropTypes.string.isRequired })(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node,
};

export default WithContext;
