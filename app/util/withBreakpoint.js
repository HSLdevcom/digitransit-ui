/* eslint-disable react/no-multi-comp */
import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import hoistNonReactStatics from 'hoist-non-react-statics';

const { Provider, Consumer } = createContext('large');

function getClientBreakpoint() {
  if (window.innerWidth < 400) {
    return 'small';
  }
  if (window.innerWidth < 900) {
    return 'medium';
  }
  return 'large';
}

export function getServerBreakpoint(userAgent) {
  return userAgent && userAgent.toLowerCase().includes('mobile')
    ? 'small'
    : 'large';
}

export class ClientProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    serverGuessedBreakpoint: PropTypes.string,
  };

  static defaultProps = {
    serverGuessedBreakpoint: null,
  };

  state = {
    breakpoint: this.props.serverGuessedBreakpoint || getClientBreakpoint(),
  };

  componentDidMount() {
    this.updateBreakpoint = throttle(
      () =>
        this.setState(
          ({ breakpoint }) =>
            getClientBreakpoint() !== breakpoint
              ? { breakpoint: getClientBreakpoint() }
              : null,
        ),
      100,
    );
    this.updateBreakpoint();
    window.addEventListener('resize', this.updateBreakpoint);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBreakpoint);
  }

  render() {
    return <Provider value={this.state.breakpoint} {...this.props} />;
  }
}

export const BreakpointProvider = Provider;

/**
 * Extracts breakpoint information (can be one of: large, medium and small) from the context.
 */
export const BreakpointConsumer = Consumer;

export function DesktopOrMobile({ desktop, mobile }) {
  return (
    <Consumer>
      {breakpoint => (breakpoint === 'large' ? desktop() : mobile())}
    </Consumer>
  );
}

DesktopOrMobile.propTypes = {
  desktop: PropTypes.func.isRequired,
  mobile: PropTypes.func.isRequired,
};

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

/**
 * Extends the given Component with breakpoint handling. The breakpoint is
 * extracted from context and given to the extended component as a property.
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
