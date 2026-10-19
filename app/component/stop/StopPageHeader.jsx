import React from 'react';
import { PropTypes } from 'prop-types';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import { stopShape, stationShape } from '../../../utils/client/shapes';

function StopPageHeader({ stop, station, breakpoint, isTerminal = false }) {
  const props = {
    stop: stop || station,
    className: 'stop-page header',
    headingStyle: 'h3',
    icons: [],
    breakpoint,
    isTerminal,
  };
  return <StopCardHeaderContainer {...props} />;
}

StopPageHeader.propTypes = {
  stop: stopShape,
  station: stationShape,
  breakpoint: PropTypes.string,
  isTerminal: PropTypes.bool,
};

export default withBreakpoint(StopPageHeader);
