import React, { useEffect, useRef } from 'react';
import { useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { useRouter } from 'found';
import { errorShape, fragmentRefShape } from '../../../utils/client/shapes';
import Icon from '../Icon';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from '../RouteNumber';
import RouteControlPanel from './RouteControlPanel';
import {
  PREFIX_ROUTES,
  PREFIX_DISRUPTION,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from '../../../utils/shared/path';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import BackButton from '../BackButton';
import {
  getRouteMode,
  modeToTranslationId,
} from '../../../utils/client/modeUtils';
import {
  getModeIconColor,
  ensureColorAccessibleOnWhite,
} from '../../../utils/shared/colorUtils';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RouteNotificationButton from './RouteNotificationButton';
import { useConfigContext } from '../../hooks/ConfigContext';
import { isLocalCallAgency } from '../../../utils/client/legUtils';
import RoutePageFragment from './queries/RoutePageFragment';

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

export default function RoutePage({
  route: routeRef = null,
  error = undefined,
}) {
  const TABS = [PREFIX_STOPS, PREFIX_TIMETABLE, PREFIX_DISRUPTION];
  const intl = useIntl();
  const config = useConfigContext();
  const { router, match } = useRouter();
  const breakpoint = useBreakpoint();
  const route = useFragment(RoutePageFragment, routeRef);

  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [match.params.patternId]);

  // Relay failed to fetch data — surface the error to the React error boundary
  if (error && !route) {
    throw error.message;
  }

  const { tripId, patternId } = match.params;

  if (route == null) {
    /* In this case there is little we can do
     * There is no point continuing rendering as it can only
     * confuse user. Therefore redirect to Routes page */
    router.replace(`/${PREFIX_ROUTES}`);
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
  const matchingNotification = config.routeNotifications?.find(n =>
    n.showForRoute?.(route),
  );
  const localCallAgency = isLocalCallAgency({ route }, config);

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
              className={cx('route-short-name', mode, {
                'call-local': localCallAgency,
              })}
              ref={headingRef}
              tabIndex={-1}
              style={{ color: shortNameColor }}
            >
              <span className="sr-only" style={{ whiteSpace: 'pre' }}>
                {intl.formatMessage({
                  id: modeToTranslationId(mode, config),
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
              {matchingNotification?.closeButtonLabel?.[intl.locale] && (
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
        <RouteAgencyInfo route={route} />
      </div>
      {route.patterns && !tripId && TABS.includes(match.params.type) && (
        <RouteControlPanel route={route} breakpoint={breakpoint} />
      )}
    </div>
  );
}

RoutePage.propTypes = {
  route: fragmentRefShape,
  error: errorShape,
};
