import PropTypes from 'prop-types';
import React from 'react';
import some from 'lodash/some';
import getContext from 'recompose/getContext';

import StopPageTabContainer from './StopPageTabContainer';

function StopPage(props) {
  if (some(props.routes, 'fullscreenMap') && props.breakpoint !== 'large') {
    return null;
  }

  return (
    <div className="stop-page-content-wrapper">
      <StopPageTabContainer
        baseUrl={
          props.params.stopId
            ? `/pysakit/${props.params.stopId}`
            : `/terminaalit/${props.params.terminalId}`
        }
      />
      {props.children}
    </div>
  );
}

StopPage.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }),
  ).isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({
      stopId: PropTypes.string.isRequired,
    }).isRequired,
    PropTypes.shape({
      terminalId: PropTypes.string.isRequired,
    }).isRequired,
  ]).isRequired,
};

export default getContext({ breakpoint: PropTypes.string.isRequired })(
  StopPage,
);
