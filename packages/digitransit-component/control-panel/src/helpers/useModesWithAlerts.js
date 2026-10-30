import { useEffect, useState } from 'react';

const NO_MODES = [];

/** Returns upper case names of the modes that currently have alerts */
export default function useModesWithAlerts(alertsContext) {
  const [modes, setModes] = useState(NO_MODES);

  useEffect(() => {
    if (!alertsContext) {
      return undefined;
    }
    let cancelled = false;
    alertsContext
      .getModesWithAlerts(alertsContext.currentTime, alertsContext.feedIds)
      .then(res => {
        if (!cancelled) {
          setModes(res);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return modes;
}
