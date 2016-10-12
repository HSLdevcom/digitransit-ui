import React, { PropTypes } from 'react';
import getContext from 'recompose/getContext';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';


const AppBarContainer = ({ breakpoint, ...args }) =>
  ((breakpoint !== 'large' &&
    <AppBarSmall {...args} />) || <AppBarLarge {...args} />
);

const WithContext = getContext({ breakpoint: React.PropTypes.string.isRequired })(AppBarContainer);

WithContext.propTypes = {
  disableBackButton: PropTypes.bool,
  title: PropTypes.node.isRequired,
  showLogo: PropTypes.bool,
};

export default WithContext;
