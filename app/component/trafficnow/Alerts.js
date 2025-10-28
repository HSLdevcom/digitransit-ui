import React from 'react';
import cx from 'classnames';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { FormattedMessage } from 'react-intl';
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
    <div
      className={cx('traffic-now__bottom__alerts', {
        'traffic-now__bottom__alerts--desktop': desktop,
      })}
    >
      <FormattedMessage
        id="disruptions-found-amount"
        values={{ amount: alerts.length }}
        defaultValue="Hello world!"
      >
        {msg => <h3>{msg}</h3>}
      </FormattedMessage>
      <div className="traffic-now__bottom__alerts-list">{rows}</div>
    </div>
  );
}

Alerts.propTypes = {};
Alerts.defaultProps = {};
