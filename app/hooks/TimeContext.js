import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Refresh interval for the current time, in milliseconds.
export const TWICE_PER_MINUTE = 30 * 1000;

function getCurrentUnixTime() {
  if (process.env.NODE_ENV === 'test') {
    // Set current time to Tue Dec 28 2021 for E2E-tests
    return Math.floor(Date.parse('2021-12-28T12:57:00+00:00') / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

const TimeContext = createContext();

// Exported for test helpers that need to provide a fixed time value.
export { TimeContext };

/**
 * Provides the current unix time (in seconds), refreshed every 30 seconds.
 * Replaces the old Fluxible TimeStore.
 */
export function TimeProvider({ children }) {
  const [currentTime, setCurrentTime] = useState(getCurrentUnixTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getCurrentUnixTime());
    }, TWICE_PER_MINUTE);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <TimeContext.Provider value={currentTime}>{children}</TimeContext.Provider>
  );
}

export function useCurrentTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useCurrentTime must be used within a TimeProvider');
  }
  return context;
}

TimeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Injects the current time as a `currentTime` prop, replacing the old
 * `connectToStores(Component, ['TimeStore'], ...)` pattern.
 */
export function withCurrentTime(Component) {
  function WithCurrentTime(props) {
    const currentTime = useCurrentTime();
    return <Component {...props} currentTime={currentTime} />;
  }
  WithCurrentTime.displayName = `WithCurrentTime(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WithCurrentTime;
}
