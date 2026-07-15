import React, { useMemo, useRef } from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';
import { DateTime } from 'luxon';
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
import { TRAFFICNOW } from '../../util/path';

export default function Disruptions() {
  const breakpoint = useBreakpoint();
  const config = useConfigContext();
  const ref = useRef();
  const { router } = useRouter();
  const { selectedFilters } = useFilterContext();

  const disruptionCardOnClick = id => {
    router.push(`/${TRAFFICNOW}/hairio/${id}`);
  };

  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds: config.feedIds,
  });

  // If no modes are selected, fetch cancelations for all
  const modesToFetch =
    selectedFilters.vehicleModes.length === 0
      ? [
          TransportMode.Bus,
          TransportMode.Tram,
          TransportMode.Rail,
          TransportMode.Subway,
          TransportMode.Ferry,
        ]
      : selectedFilters.vehicleModes.map(mode => mode.toUpperCase());
  const canceledTripsVars = {
    serviceDateRanges: [
      {
        start: DateTime.now().toISODate(),
        end: null,
      },
    ],
    fetchBus: modesToFetch.includes(TransportMode.Bus),
    fetchTram: modesToFetch.includes(TransportMode.Tram),
    fetchRail: modesToFetch.includes(TransportMode.Rail),
    fetchSubway: modesToFetch.includes(TransportMode.Subway),
    fetchFerry: modesToFetch.includes(TransportMode.Ferry),
  };

  const cancelationsByMode = useLazyLoadQuery(
    CanceledTripsOverviewQuery,
    canceledTripsVars,
  );

  const canceledModes = Object.entries(cancelationsByMode)
    .map(([key, value]) => value.routes.length && { key, ...value })
    .filter(Boolean);
  const disruptions = useMemo(
    () => filterAndSortAlerts(alerts, selectedFilters),
    [alerts, selectedFilters],
  );

  const mobile = breakpoint !== 'large';

  const noResults = !disruptions.length && !canceledModes.length;

  const resultAmount = canceledModes.length + disruptions.length;

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
            {canceledModes.map(({ key, routes }) => (
              <CanceledTripCard
                isMobile={mobile}
                key={key}
                mode={key}
                routes={routes}
              />
            ))}
            {disruptions.map(a => (
              <DisruptionCard
                key={a.id}
                alert={a}
                onClick={disruptionCardOnClick}
                isMobile={mobile}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
