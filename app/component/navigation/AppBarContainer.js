import React, { PropTypes } from 'react';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';


const AppBarContainer = ({ breakpoint, router, ...args }) =>
  ((breakpoint !== 'large' &&
    <AppBarSmall {...args} />) || <AppBarLarge {...args} titleClicked={() => router.push('/')} />
);

const WithContext = getContext({ router: React.PropTypes.object.isRequired, breakpoint: React.PropTypes.string.isRequired })(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node.isRequired,
  showLogo: PropTypes.bool,
};

export default WithContext;
