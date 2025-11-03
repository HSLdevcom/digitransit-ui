import React from 'react';
import cx from 'classnames';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { FormattedMessage } from 'react-intl';
import DisruptionCard from './DisruptionCard';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import AlertsQuery from './queries/AlertsQuery';
import NoAlerts from './NoAlerts';

export default function Alerts() {
  const breakpoint = useBreakpoint();
  const { feedIds } = useConfigContext();

  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds,
  });

  const desktop = breakpoint === 'large';

  return (
    <div
      className={cx('traffic-now__bottom__alerts', {
        'traffic-now__bottom__alerts--desktop': desktop,
      })}
    >
      {alerts.length === 0 ? (
        <NoAlerts />
      ) : (
        <>
          <FormattedMessage
            id="disruptions-found-amount"
            values={{ amount: alerts.length }}
            defaultValue="No disruptions found"
            tagName="h3"
          />
          <div className="traffic-now__bottom__alerts-list">
            {alerts.map(a => (
              <DisruptionCard key={a.id} alert={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

Alerts.propTypes = {};
Alerts.defaultProps = {};
