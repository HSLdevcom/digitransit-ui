/* eslint-disable react/no-multi-comp */
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

export const BreakpointContext = createContext('large');
const { Provider, Consumer } = BreakpointContext;

// Only nullish widths use the viewport (or large without window); 0 selects small.
export function getClientBreakpoint(width) {
  if (width == null && typeof window === 'undefined') {
    return 'large';
  }

  const matchWidth = width ?? window.innerWidth;
  if (matchWidth < 400) {
    return 'small';
  }
  if (matchWidth < 900) {
    return 'medium';
  }
  return 'large';
}

export class BreakpointProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = {
    breakpoint: getClientBreakpoint(),
  };

  componentDidMount() {
    if (typeof window === 'undefined') {
      return;
    }

    this.updateBreakpoint = throttle(() => {
      const nextBreakpoint = getClientBreakpoint();
      this.setState(({ breakpoint }) =>
        nextBreakpoint !== breakpoint ? { breakpoint: nextBreakpoint } : null,
      );
    }, 100);
    this.updateBreakpoint();
    window.addEventListener('resize', this.updateBreakpoint);
  }

  componentWillUnmount() {
    this.updateBreakpoint?.cancel();
    if (
      typeof window !== 'undefined' &&
      typeof this.updateBreakpoint === 'function'
    ) {
      window.removeEventListener('resize', this.updateBreakpoint);
    }
  }

  render() {
    return (
      <Provider value={this.state.breakpoint}>{this.props.children}</Provider>
    );
  }
}

export const BreakpointConsumer = Consumer;

/**
 * Returns the current breakpoint: small, medium or large.
 */
export function useBreakpoint() {
  return useContext(BreakpointContext);
}

export function DesktopOrMobile({ desktop, mobile }) {
  const breakpoint = useBreakpoint();
  return breakpoint === 'large' ? desktop() : mobile();
}

DesktopOrMobile.propTypes = {
  desktop: PropTypes.func.isRequired,
  mobile: PropTypes.func.isRequired,
};
