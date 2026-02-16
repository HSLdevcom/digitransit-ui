import React, { useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { FormattedMessage } from 'react-intl';
import DisruptionCard from './DisruptionCard';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import AlertsQuery from './queries/AlertsQuery';
import NoAlerts from './NoAlerts';
import { useFilterContext } from './filters/FiltersContext';
import { filterAndSortAlerts } from './filters/filterUtils';

export default function Alerts() {
  const breakpoint = useBreakpoint();
  const { feedIds } = useConfigContext();
  const [activeAlertId, setActiveAlertId] = useState();
  const ref = useRef();
  const { selectedFilters } = useFilterContext();

  const handleCardClick = id => {
    setActiveAlertId(id);
  };

  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds,
  });

  const filteredAlerts = useMemo(
    () => filterAndSortAlerts(alerts, selectedFilters),
    [alerts, selectedFilters],
  );

  const desktop = breakpoint === 'large';

  return (
    <div
      ref={ref}
      className={cx('traffic-now__content__alerts', {
        'traffic-now__content__alerts--desktop': desktop,
      })}
    >
      {filteredAlerts.length === 0 ? (
        <NoAlerts />
      ) : (
        <>
          <FormattedMessage
            id="disruptions-found-amount"
            values={{ amount: filteredAlerts.length }}
            defaultValue="No disruptions found"
          >
            {msg => <h3 className="heading-xs">{msg}</h3>}
          </FormattedMessage>
          <div className="traffic-now__content__alerts-list">
            {filteredAlerts.map(a => (
              <DisruptionCard
                key={a.id}
                alert={a}
                isOpen={activeAlertId === a.id}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

Alerts.propTypes = {};
Alerts.defaultProps = {};
