/* eslint-disable max-classes-per-file */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { BreakpointConsumer as Consumer } from './BreakpointContext';

export {
  BreakpointContext,
  BreakpointProvider,
  BreakpointConsumer,
  DesktopOrMobile,
  getClientBreakpoint,
  useBreakpoint,
} from './BreakpointContext';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

/**
 * Extends the given Component with breakpoint handling. The breakpoint is
 * extracted from context and given to the extended component as a property.
 *
 * @deprecated Use useBreakpoint from BreakpointContext in functional components.
 *
 * @param {*} Component The component to extend with breakpoint handling
 * @param {boolean} forwardRef Whether any ref given to the HOC should be forwarded to the extended Component.
 */
function withBreakpoint(Component, { forwardRef } = { forwardRef: false }) {
  class WithBreakpoint extends React.Component {
    render() {
      // eslint-disable-next-line react/prop-types
      const { breakpoint, forwardedRef, ...rest } = this.props;
      return <Component breakpoint={breakpoint} ref={forwardedRef} {...rest} />;
    }
  }
  WithBreakpoint.displayName = `WithBreakpoint(${getDisplayName(Component)})`;
  hoistNonReactStatics(WithBreakpoint, Component);

  return forwardRef
    ? React.forwardRef((props, ref) => (
        <Consumer>
          {breakpoint => (
            <WithBreakpoint
              {...props}
              breakpoint={breakpoint}
              forwardedRef={ref}
            />
          )}
        </Consumer>
      ))
    : props => (
        <Consumer>
          {breakpoint => <WithBreakpoint {...props} breakpoint={breakpoint} />}
        </Consumer>
      );
}

export default withBreakpoint;
