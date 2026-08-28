import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';
import { DateTime } from 'luxon';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { useConfigContext } from '../../configurations/ConfigContext';
import { TransportMode } from '../../constants';
import { useBreakpoint } from '../../util/withBreakpoint';
import Icon from '../Icon';
import CanceledTripCard from './CanceledTripCard';
import DisruptionCard from './DisruptionCard';
import NoDisruptions from './components/NoDisruptions';
import { useFilterContext } from './filters/FiltersContext';
import {
  filterAndSortAlerts,
  filterCanceledModes,
} from './filters/filterUtils';
import AlertsQuery from './queries/AlertsQuery';
import CanceledTripsOverviewQuery from './queries/CanceledTripsOverviewQuery';
import { buildDisruptionCards } from './utils';
import { TRAFFICNOW } from '../../util/path';
import { splitGtfsId } from '../../util/gtfs';

const POLL_INTERVAL_MS = 60 * 1000;

const buildAlertsFingerprint = alerts =>
  alerts
    .map(
      a =>
        `${a.id}|${a.effectiveStartDate}|${a.effectiveEndDate}|${a.alertSeverityLevel}`,
    )
    .sort()
    .join(';');

// filters out routes with non relevant feedId:s and modes without any routes
export function getCanceledModes(cancelationsByMode, feedIds) {
  return Object.entries(cancelationsByMode)
    .map(([key, value]) => ({
      key,
      ...value,
      routes: value.routes.filter(({ route }) =>
        feedIds.includes(splitGtfsId(route.gtfsId).feedId),
      ),
    }))
    .filter(({ routes }) => routes.length);
}

export default function Disruptions() {
  const breakpoint = useBreakpoint();
  const config = useConfigContext();
  const { router } = useRouter();
  const { selectedFilters } = useFilterContext();

  const [hasUpdates, setHasUpdates] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);
  const displayedFingerprintRef = useRef(null);

  const {
    URL: { OTP: otpUrl },
    feedIds,
    hasAPISubscriptionQueryParameter,
    API_SUBSCRIPTION_QUERY_PARAMETER_NAME: subParamName,
    API_SUBSCRIPTION_TOKEN: subToken,
  } = config;
  const feedIdsStr = feedIds.join(',');

  const disruptionCardOnClick = id => {
    router.push(`/${TRAFFICNOW}/hairio/${id}`);
  };

  const { alerts } = useLazyLoadQuery(
    AlertsQuery,
    { feedIds },
    { fetchKey, fetchPolicy: 'network-only' },
  );

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
    { fetchKey },
  );

  const canceledModes = getCanceledModes(cancelationsByMode, feedIds);

  // Capture fingerprint of the currently displayed alerts after each (re)load
  useEffect(() => {
    displayedFingerprintRef.current = buildAlertsFingerprint(alerts);
    setHasUpdates(null);
  }, [fetchKey]);

  // Poll for server-side changes without updating the Relay store
  useEffect(() => {
    const queryParam = hasAPISubscriptionQueryParameter
      ? `?${subParamName}=${encodeURIComponent(subToken)}`
      : '';
    const endpoint = `${otpUrl}gtfs/v1${queryParam}`;
    const ids = feedIdsStr ? feedIdsStr.split(',') : [];

    const checkForUpdates = async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query:
              'query DisruptionsPoll($feedIds:[String!]){alerts(feeds:$feedIds){id effectiveStartDate effectiveEndDate alertSeverityLevel}}',
            variables: { feedIds: ids },
          }),
        });
        if (!res.ok) {
          return;
        }
        const json = await res.json();
        if (!json?.data?.alerts) {
          return;
        }
        if (
          buildAlertsFingerprint(json.data.alerts) !==
          displayedFingerprintRef.current
        ) {
          setHasUpdates(true);
        }
      } catch {
        // ignore network errors silently
      }
    };

    const intervalId = setInterval(checkForUpdates, POLL_INTERVAL_MS);
    return () => {
      clearInterval(intervalId);
    };
  }, [
    otpUrl,
    feedIdsStr,
    hasAPISubscriptionQueryParameter,
    subParamName,
    subToken,
  ]);

  const handleRefresh = () => {
    setFetchKey(k => k + 1);
  };

  const canceledModesFiltered =
    selectedFilters.validityPeriod === 'UPCOMING'
      ? []
      : filterCanceledModes(canceledModes, selectedFilters);

  const disruptions = filterAndSortAlerts(alerts, selectedFilters);

  const disruptionCards = buildDisruptionCards(
    disruptions,
    selectedFilters,
    config,
  );

  const mobile = breakpoint !== 'large';

  const noResults = !disruptions.length && !canceledModesFiltered.length;

  const resultAmount = canceledModesFiltered.length + disruptionCards.length;

  return (
    <div
      className={cx('disruptions', {
        'disruptions--mobile': mobile,
      })}
    >
      {hasUpdates && (
        <div className="disruptions-update-banner-anchor">
          <div className="disruptions-update-banner" role="status">
            <span className="disruptions-update-banner__text">
              <Icon img="icon_update" />
              <FormattedMessage id="disruptions-update-available" />
            </span>
            <button
              type="button"
              className="disruptions-update-banner__action"
              onClick={handleRefresh}
            >
              <FormattedMessage id="disruptions-refresh" />
            </button>
          </div>
        </div>
      )}
      <div className="disruptions__scroll">
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
              {canceledModesFiltered.map(({ key, routes }) => (
                <CanceledTripCard
                  isMobile={mobile}
                  key={key}
                  mode={key}
                  routes={routes}
                />
              ))}
              {disruptionCards.map(({ key, alert, mode }) => (
                <DisruptionCard
                  key={key}
                  alert={alert}
                  mode={mode}
                  onClick={disruptionCardOnClick}
                  isMobile={mobile}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
