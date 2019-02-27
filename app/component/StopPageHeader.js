import PropTypes from 'prop-types';
import React from 'react';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import compose from 'recompose/compose';

import StopCardHeaderContainer from './StopCardHeaderContainer';
import ComponentUsageExample from './ComponentUsageExample';
import withBreakpoint from '../util/withBreakpoint';

const StopPageHeader = compose(
  withBreakpoint,
  getContext({
    executeAction: PropTypes.func.isRequired,
  }),
  mapProps(props => ({
    stop: props.stop,
    className: 'stop-page header',
    headingStyle: 'h3',
    icons: [],
  })),
)(StopCardHeaderContainer);

const exampleStop = {
  code: '4611',
  gtfsId: 'HSL:1541157',
  name: 'Kaivonkatsojanpuisto',
  desc: 'Kaivonkatsojantie',
  zoneId: 'C',
};

StopPageHeader.displayName = 'StopPageHeader';

StopPageHeader.description = () => (
  <div>
    <ComponentUsageExample description="basic">
      <StopPageHeader stop={exampleStop} params={{ stopId: 123 }} />
    </ComponentUsageExample>
  </div>
);

export default StopPageHeader;
