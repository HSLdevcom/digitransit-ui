import React from 'react';
import cx from 'classnames';
import { useLazyLoadQuery } from 'react-relay/hooks';
import DisruptionCard from './DisruptionCard';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import AlertsQuery from './queries/AlertsQuery';

export default function Alerts() {
  const breakpoint = useBreakpoint();
  const { feedIds } = useConfigContext();

  // Fetch alerts when component mounts
  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds,
  });

  const desktop = breakpoint === 'large';

  const rows = alerts.map(a => <DisruptionCard key={a.id} alert={a} />);

  return (
    <div className={cx('alerts', desktop && 'desktop')}>
      <h3>Löytyi {alerts.length} tiedotetta</h3>
      <div className="list">{rows}</div>
    </div>
  );
}

Alerts.propTypes = {};
Alerts.defaultProps = {};
