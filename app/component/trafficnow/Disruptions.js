import React, { useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { useConfigContext } from '../../configurations/ConfigContext';
import { TransportMode } from '../../constants';
import { useBreakpoint } from '../../util/withBreakpoint';
import CanceledTripCard from './CanceledTripCard';
import DisruptionCard from './DisruptionCard';
import NoDisruptions from './components/NoDisruptions';
import { useFilterContext } from './filters/FiltersContext';
import { filterAndSortAlerts } from './filters/filterUtils';
import AlertsQuery from './queries/AlertsQuery';
import CanceledTripsOverviewQuery from './queries/CanceledTripsOverviewQuery';
import { getAvailableModes } from './utils';

const CANCELED_TRIPS_OVERVIEW_QUERY_AMOUNT = 1;

export default function Disruptions() {
  const breakpoint = useBreakpoint();
  const config = useConfigContext();
  const [activeAlertId, setActiveAlertId] = useState();
  const ref = useRef();
  const { selectedFilters } = useFilterContext();

  const handleCardClick = id => {
    setActiveAlertId(id);
  };

  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds: config.feedIds,
  });

  const availableModes = getAvailableModes(config);

  const canceledTripsVars = {
    amount: CANCELED_TRIPS_OVERVIEW_QUERY_AMOUNT,
    fetchBus: availableModes.includes(TransportMode.Bus),
    fetchTram: availableModes.includes(TransportMode.Tram),
    fetchRail: availableModes.includes(TransportMode.Rail),
    fetchSubway: availableModes.includes(TransportMode.Subway),
    fetchFerry: availableModes.includes(TransportMode.Ferry),
  };

  const { bus, tram, rail, subway, ferry } = useLazyLoadQuery(
    CanceledTripsOverviewQuery,
    canceledTripsVars,
  );

  const disruptions = useMemo(
    () => filterAndSortAlerts(alerts, selectedFilters),
    [alerts, selectedFilters],
  );

  const mobile = breakpoint !== 'large';

  const canceledModes = [
    bus && { key: 'bus', ...bus },
    tram && { key: 'tram', ...tram },
    rail && { key: 'rail', ...rail },
    subway && { key: 'subway', ...subway },
    ferry && { key: 'ferry', ...ferry },
  ].filter(Boolean);

  const noResults =
    !disruptions.length && !canceledModes.some(mode => mode.totalCount > 0);

  const resultAmount = canceledModes.reduce(
    (sum, mode) => (mode.totalCount > 0 ? sum + 1 : sum),
    disruptions.length,
  );

  return (
    <div
      ref={ref}
      className={cx('disruptions', {
        'disruptions--mobile': mobile,
      })}
    >
      {noResults ? (
        <NoDisruptions />
      ) : (
        <>
          <FormattedMessage
            id="disruptions-found-amount"
            values={{ amount: resultAmount }}
            defaultValue="No disruptions found"
          >
            {msg => <h3 className="heading-xs">{msg}</h3>}
          </FormattedMessage>
          <div className="disruptions-list">
            {canceledModes.map(
              ({ key, totalCount, edges }) =>
                edges.length > 0 && (
                  <CanceledTripCard
                    key={key}
                    mode={key}
                    totalCount={totalCount}
                    trips={edges.map(({ node }) => node)}
                  />
                ),
            )}
            {disruptions.map(a => (
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
