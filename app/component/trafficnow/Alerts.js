import React, { useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { FormattedMessage } from 'react-intl';
import DisruptionCard from './DisruptionCard';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import AlertsQuery from './queries/AlertsQuery';
import NoAlerts from './NoAlerts';
import useWindowResize from '../../hooks/useWindowSize';

export default function Alerts() {
  const breakpoint = useBreakpoint();
  const { feedIds } = useConfigContext();
  const [activeAlertId, setActiveAlertId] = useState();
  const { height } = useWindowResize();
  const ref = useRef();
  const [top, setTop] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setTop(ref.current.getBoundingClientRect().top);
    }
  }, [height]);

  const handleCardClick = id => {
    setActiveAlertId(id);
  };

  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds,
  });

  const desktop = breakpoint === 'large';

  return (
    <div
      ref={ref}
      className={cx('traffic-now__content__alerts', {
        'traffic-now__content__alerts--desktop': desktop,
      })}
      style={{
        maxHeight: `calc(100vh - ${top}px)`,
      }}
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
          <div className="traffic-now__content__alerts-list">
            {alerts.map(a => (
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
