import { useBreakpoint } from '../../hooks/BreakpointContext';
import { fragmentRefShape } from '../../../utils/client/shapes';
import StopCardHeader from './StopCardHeader';

export default function StopPageHeader({ stop }) {
  const breakpoint = useBreakpoint();
  return (
    stop && (
      <StopCardHeader
        stop={stop}
        className="stop-page header"
        headingStyle="h3"
        icons={[]}
        breakpoint={breakpoint}
      />
    )
  );
}

StopPageHeader.propTypes = {
  stop: fragmentRefShape,
};
