/* eslint-disable react/no-multi-comp */
import React, { createContext, useContext, useEffect, useState } from 'react';
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

export function BreakpointProvider({ children }) {
  const [breakpoint, setBreakpoint] = useState(() => getClientBreakpoint());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const browserWindow = window;
    const updateBreakpoint = throttle(() => {
      const nextBreakpoint = getClientBreakpoint();
      setBreakpoint(currentBreakpoint =>
        nextBreakpoint !== currentBreakpoint
          ? nextBreakpoint
          : currentBreakpoint,
      );
    }, 100);

    updateBreakpoint();
    browserWindow.addEventListener('resize', updateBreakpoint);

    return () => {
      updateBreakpoint.cancel();
      browserWindow.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return <Provider value={breakpoint}>{children}</Provider>;
}

BreakpointProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

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
