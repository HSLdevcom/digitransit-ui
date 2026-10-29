import PropTypes from 'prop-types';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { stopShape, stationShape } from '../../../utils/client/shapes';

function StopPageHeader({ stop, station, isTerminal = false }) {
  const breakpoint = useBreakpoint();
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
  isTerminal: PropTypes.bool,
};

export default StopPageHeader;
