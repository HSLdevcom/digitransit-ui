import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { matchShape } from 'found';
import { routeShape, errorShape } from '../../util/shapes';
import Icon from '../Icon';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from '../RouteNumber';
import RouteControlPanel from './RouteControlPanel';
import {
  PREFIX_ROUTES,
  PREFIX_DISRUPTION,
  routePagePath,
} from '../../util/path';
import withBreakpoint from '../../util/withBreakpoint';
import BackButton from '../BackButton';
import { getRouteMode } from '../../util/modeUtils';
import {
  getModeIconColor,
  ensureColorAccessibleOnWhite,
} from '../../util/colorUtils';
import AlertBanner from '../AlertBanner';
import {
  hasEntitiesOfType,
  hasMeaningfulData,
  isAlertValid,
} from '../../util/alertUtils';
import { AlertEntityType } from '../../constants';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RouteNotificationButton from './RouteNotificationButton';
import { isLocalCallAgency } from '../../util/legUtils';
import { useConfigContext } from '../../configurations/ConfigContext';

function resolveHeadsign(pattern) {
  if (!pattern) {
    return null;
  }
  const isNetex = pattern.code.startsWith('NETEX:');
  if (!isNetex && pattern.headsign) {
    return pattern.headsign;
  }
  return pattern.stops[pattern.stops.length - 1].name;
}

function RoutePage({
  route,
  match,
  breakpoint,
  error = undefined,
  currentTime,
}) {
  const intl = useIntl();
  const config = useConfigContext();

  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [match.params.patternId]);

  // Relay failed to fetch data — surface the error to the React error boundary
  if (error && !route) {
    throw error.message;
  }

  const { tripId, patternId, routeId } = match.params;

  if (route == null) {
    /* In this case there is little we can do
     * There is no point continuing rendering as it can only
     * confuse user. Therefore redirect to Routes page */
    match.router.replace(`/${PREFIX_ROUTES}`);
    return null;
  }
  const mode = getRouteMode(route, config);
  const rawRouteColor = route.color
    ? `#${route.color}`
    : getModeIconColor(config, mode);
  const shortNameColor = ensureColorAccessibleOnWhite(rawRouteColor);
  const label = route.shortName ? route.shortName : route.longName || '';
  const selectedPattern =
    patternId && route.patterns.find(p => p.code === patternId);
  const headsign = resolveHeadsign(selectedPattern || null);
  const filteredAlerts = selectedPattern?.alerts
    ?.filter(alert => hasEntitiesOfType(alert, AlertEntityType.Route))
    .filter(alert => isAlertValid(alert, currentTime));
  const localCallAgency = isLocalCallAgency({ route }, config);
  const matchingNotification = config.routeNotifications?.find(n =>
    n.showForRoute?.(route),
  );
  return (
    <div className="route-page-container">
      <div className="header-for-printing">
        <h1>
          {config.title}
          {` - `}
          <FormattedMessage id="route-guide" defaultMessage="Route guide" />
        </h1>
      </div>
      <div
        className={cx('route-container', {
          'bp-large': breakpoint === 'large',
        })}
      >
        <div className="route-header">
          {breakpoint === 'large' && <BackButton />}
          <div aria-hidden="true">
            <RouteNumber
              color={route.color ? `#${route.color}` : null}
              mode={mode}
              text=""
              appendClass={localCallAgency ? 'call-local' : ''}
              isCallAgency={mode === 'call'}
            />
          </div>
          <div className="route-info">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className={cx('route-short-name', mode, {
                'call-local': localCallAgency,
              })}
              style={{ color: shortNameColor }}
            >
              <span className="sr-only" style={{ whiteSpace: 'pre' }}>
                {intl.formatMessage({
                  id: mode,
                })}{' '}
                {label?.toLowerCase()}
              </span>
              <span aria-hidden="true">{label}</span>
            </h1>
            {tripId && headsign && (
              <div className="trip-destination">
                <Icon className="in-text-arrow" img="icon_arrow-right" />
                <div className="destination-headsign">{headsign}</div>
              </div>
            )}
          </div>
          {!tripId && (
            <div className="route-header-actions">
              {matchingNotification &&
                matchingNotification.closeButtonLabel?.[intl.locale] && (
                  <>
                    <RouteNotificationButton
                      notification={matchingNotification}
                    />
                    <span className="route-header-divider" aria-hidden="true" />
                  </>
                )}
              <FavouriteRouteContainer
                className="route-page-header"
                gtfsId={route.gtfsId}
              />
            </div>
          )}
        </div>
        {tripId && hasMeaningfulData(filteredAlerts) && (
          <div className="trip-page-alert-container">
            <AlertBanner
              alerts={filteredAlerts}
              linkAddress={routePagePath(routeId, PREFIX_DISRUPTION, patternId)}
            />
          </div>
        )}
        <RouteAgencyInfo route={route} />
      </div>
      {route.patterns && match.params.type === PREFIX_DISRUPTION && (
        <RouteControlPanel
          match={match}
          route={route}
          breakpoint={breakpoint}
        />
      )}
    </div>
  );
}

RoutePage.propTypes = {
  route: routeShape.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  error: errorShape,
  currentTime: PropTypes.number.isRequired,
};

const containerComponent = createFragmentContainer(
  connectToStores(withBreakpoint(RoutePage), ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  })),
  {
    route: graphql`
      fragment RoutePage_route on Route
      @argumentDefinitions(date: { type: "String" }) {
        gtfsId
        color
        shortName
        longName
        mode
        type
        ...RouteAgencyInfo_route
        ...RoutePatternSelectContainer_route @arguments(date: $date)
        agency {
          name
          phone
          gtfsId
        }
        patterns {
          alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
            entities {
              __typename
              ... on Route {
                color
                type
                mode
                shortName
                gtfsId
              }
              ... on Stop {
                name
                code
                vehicleMode
                gtfsId
              }
            }
          }
          headsign
          code
          stops {
            name
          }
          trips: tripsForDate(serviceDate: $date) {
            stoptimes: stoptimesForDate(serviceDate: $date) {
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
        }
      }
    `,
  },
);

export { containerComponent as default, RoutePage as Component };
