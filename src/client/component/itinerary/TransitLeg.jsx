import cx from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import { Text } from '@hsl-fi/layout-primitives';
import LegAgencyInfo from './LegAgencyInfo';
import Icon from '../Icon';
import ItineraryCircleLine from './ItineraryCircleLine';
import ItineraryMapAction from './ItineraryMapAction';
import PlatformNumber from '../PlatformNumber';
import ServiceAlertIcon from '../ServiceAlertIcon';
import StopCode from '../StopCode';
import {
  alertSeverityCompare,
  getActiveAlertSeverityLevel,
  getActiveLegAlerts,
  getActiveLegAlertSeverityLevel,
  getMaximumAlertSeverityLevel,
  hasEntitiesOfType,
} from '../../utils/alertUtils';
import { modeToTranslationId } from '../../utils/modeUtils';
import { PREFIX_DISRUPTION, routePagePath, stopPagePath } from '../../../shared/utils/path';
import { durationToString } from '../../utils/timeUtils';
import { addAnalyticsEvent } from '../../../shared/utils/analyticsUtils';
import {
  getLegHeadsign,
  showBikeBoardingNote,
  showCarBoardingNote,
  legTimeStr,
  legTime,
  isPlatformChanged,
  getValidatedLegName,
  isLocalCallAgency,
} from '../../utils/legUtils';
import { splitStringToAddressAndPlace } from '../../../shared/utils/otpStrings';
import { AlertEntityType, AlertSeverityLevelType } from '../../../shared/utils/constants';
import { legShape } from '../../utils/shapes';
import StopInfo from './StopInfo';
import InterlineInfo from './InterlineInfo';
import AlternativeLegsInfo from './AlternativeLegsInfo';
import LegInfo from './LegInfo';
import {
  getBoardingInformationText,
  getTrackOrPierOrPlatformChangeText,
} from '../../utils/localeUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import useCanceledStopIds from './useCanceledStopIds';
import RouteNotification from './RouteNotification';
import DisruptionLink from './DisruptionLink';
import ZoneChange from './ZoneChange';
import LegFareDisclaimer from './LegFareDisclaimer';
import IntermediateStops from './IntermediateStops';

const stopCode = code => code && <StopCode code={code} />;

/**
 * Some next legs might be for example 24h in the future which seems confusing.
 * Only show alternatives that are less than 12h in the future.
 */
const filterNextLegs = l => {
  if (!l.nextLegs) {
    return [];
  }
  return l.nextLegs.filter(nextLeg => legTime(nextLeg.start) - legTime(l.start) < 12 * 3600 * 1000);
};

export default function TransitLeg({
  leg,
  interliningLegs = [],
  index,
  mode,
  focusAction,
  children,
  omitDivider,
  changeHash,
  tabIndex,
  usingOwnCarWholeTrip,
  mobile,
}) {
  const intl = useIntl();
  const config = useConfigContext();

  const [showIntermediateStops, setShowIntermediateStops] = useState(() => {
    if (interliningLegs.length >= 1) {
      return interliningLegs.reduce((sum, l) => sum + l.intermediatePlaces.length, 0) < 2;
    }
    return leg.intermediatePlaces.length < 2;
  });

  const canceledStopIds = useCanceledStopIds([leg, ...interliningLegs], showIntermediateStops);

  const [showAlternativeLegs, setShowAlternativeLegs] = useState(false);

  const isRouteConstantOperation = config.constantOperationRoutes?.[leg.route.gtfsId];

  const isCallAgency = mode === 'call';
  const routeColor = leg.route.color ? `#${leg.route.color}` : undefined;

  const displayAlternativeLegs =
    config.showAlternativeLegs &&
    !isCallAgency &&
    filterNextLegs(leg).length > 0 &&
    !isRouteConstantOperation;

  const toggleShowIntermediateStops = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: showIntermediateStops ? 'HideIntermediateStops' : 'ShowIntermediateStops',
      name: null,
    });

    setShowIntermediateStops(prevState => !prevState);
  };

  const startMs = legTime(leg.start);
  const time = legTimeStr(leg.start);
  const modeClassName = mode.toLowerCase();
  const validatedFromLegName = getValidatedLegName(leg.from.name, intl, true);
  const validatedToLegName = getValidatedLegName(leg.to.name, intl, false);

  const textVersionBeforeLink = (
    <FormattedMessage
      id="itinerary-details.transit-leg-part-1"
      values={{ time, realtime: leg.realTime ? intl.formatMessage({ id: 'realtime' }) : '' }}
    />
  );

  const platformChanged = isPlatformChanged(leg);

  const textVersionAfterLink = (
    <>
      <FormattedMessage
        id="itinerary-details.transit-leg-part-2"
        values={{
          startStop: validatedFromLegName,
          startZoneInfo: intl.formatMessage({ id: 'zone-info' }, { zone: leg.from.stop.zoneId }),
          endZoneInfo: intl.formatMessage({ id: 'zone-info' }, { zone: leg.to.stop.zoneId }),
          endStop: validatedToLegName,
          duration: durationToString(intl, leg.duration * 1000),
          trackInfo: getBoardingInformationText(intl, leg, false),
        }}
      />
      {platformChanged && getTrackOrPierOrPlatformChangeText(intl, mode)}
    </>
  );

  const alerts = getActiveLegAlerts(leg, startMs / 1000);
  const alert = [...alerts].sort(alertSeverityCompare)[0];
  const alertSeverityLevel = getMaximumAlertSeverityLevel(alerts);

  let alertSeverityDescription = null;
  if (alertSeverityLevel) {
    let id;
    switch (alertSeverityLevel) {
      case AlertSeverityLevelType.Info:
        id = 'itinerary-details.route-has-info-alert';
        break;
      case AlertSeverityLevelType.Warning:
        id = 'itinerary-details.route-has-warning-alert';
        break;
      case AlertSeverityLevelType.Severe:
        id = 'itinerary-details.route-has-severe-alert';
        break;
      case AlertSeverityLevelType.Unknown:
      default:
        id = 'itinerary-details.route-has-unknown-alert';
        break;
    }
    alertSeverityDescription = <FormattedMessage id={id} />;
  }

  const hasNoShortName =
    leg.route.shortName &&
    /^([^0-9]*)$/.test(leg.route.shortName) &&
    leg.route.shortName.length > 3;

  const headsign = getLegHeadsign(leg);

  const intermediateStopCount = interliningLegs.reduce(
    (prev, curr) => prev + curr.intermediatePlaces.length + 1,
    leg.intermediatePlaces.length,
  );

  const { showBikeBoardingInformation, showCarBoardingInformation } = leg;

  const routeNotifications = [];
  const isFlexOrigin = isCallAgency && index === 0;
  const [flexOriginAddress, flexOriginPlace] = splitStringToAddressAndPlace(
    validatedFromLegName || '',
  );

  if (config.routeNotifications && config.routeNotifications.length > 0) {
    for (let i = 0; i < config.routeNotifications.length; i++) {
      const notification = config.routeNotifications[i];
      if (
        (showBikeBoardingInformation &&
          notification.showForBikeWithPublic &&
          showBikeBoardingNote(leg, config)) ||
        (showCarBoardingInformation &&
          notification.showForCarWithPublic &&
          showCarBoardingNote(leg, config)) ||
        (notification.showForRoute?.(leg.route) && !isCallAgency)
      ) {
        routeNotifications.push(
          <div
            className={cx('disruption', {
              'no-header': !notification.header,
              'no-link': !notification.link,
            })}
            key={`note-${i}`}
          >
            {notification.link ? (
              <DisruptionLink notification={notification} />
            ) : (
              <RouteNotification notification={notification} />
            )}
          </div>,
        );
      }
    }
  }

  return (
    <>
      <div className="row itinerary-row">
        <span className="sr-only">{textVersionBeforeLink}</span>
        <div
          className={cx('small-2', 'columns', 'itinerary-time-column', {
            'has-estimate': isCallAgency,
          })}
        >
          <span className="sr-only">
            {`${intl.formatMessage({
              id: modeToTranslationId(mode, config),
            })} ${leg.route.shortName || ''} ${headsign || ''}`}
          </span>
          <span aria-hidden="true">
            <div className="itinerary-time-column-time-group">
              <div className="itinerary-time-column-time">
                <span className={cx({ realtime: leg.realTime })}>{time}</span>
              </div>
              {isCallAgency && (
                <Text
                  as="span"
                  variant="routes-xxs"
                  color="weak"
                  className="itinerary-time-column-estimate"
                >
                  <FormattedMessage id="estimate" />
                </Text>
              )}
            </div>
            <ZoneChange leg={leg} showIntermediateStops={showIntermediateStops} />
          </span>
        </div>

        <span className="sr-only">{textVersionAfterLink}</span>

        <ItineraryCircleLine
          index={index}
          modeClassName={modeClassName}
          color={routeColor}
          renderBottomMarker={
            !showIntermediateStops ||
            (leg.intermediatePlaces.length === 0 && interliningLegs.length < 1)
          }
          viaType={leg.from.viaLocationType}
          isStop
          appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
        />

        <div
          style={{ color: routeColor }}
          className={cx(
            'small-9 columns itinerary-instruction-column',
            { first: index === 0 },
            modeClassName,
          )}
        >
          <span className="sr-only">
            <FormattedMessage
              id="itinerary-summary.show-on-map"
              values={{ target: validatedFromLegName || '' }}
            />
          </span>

          <div className={cx('itinerary-leg-first-row', 'transit', { first: index === 0 })}>
            <div className="itinerary-leg-row">
              {isCallAgency ? (
                <span>
                  {isFlexOrigin ? (
                    <div className="address-container">
                      <div className="address">
                        {flexOriginAddress}
                        {leg.from.viaLocationType && (
                          <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
                        )}
                      </div>
                      <div className="place">{flexOriginPlace}</div>
                    </div>
                  ) : (
                    validatedFromLegName
                  )}
                </span>
              ) : (
                <Link
                  aria-label={validatedFromLegName?.toLowerCase()}
                  onClick={e => {
                    e.stopPropagation();
                    addAnalyticsEvent({
                      category: 'Itinerary',
                      action: 'OpenRouteFromItinerary',
                      name: mode,
                    });
                  }}
                  to={stopPagePath(false, leg.from.stop.gtfsId)}
                >
                  {validatedFromLegName}
                  {leg.from.viaLocationType && (
                    <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
                  )}
                  <Icon
                    img="icon_arrow-collapse--right"
                    className="itinerary-arrow-icon"
                    color={config.colors.primary}
                  />
                </Link>
              )}

              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={getActiveAlertSeverityLevel(leg.from.stop.alerts, startMs / 1000)}
              />

              <div className="stop-code-container">
                {stopCode(leg.from.stop.code)}
                <PlatformNumber
                  number={leg.from.stop.platformCode}
                  short
                  mode={mode}
                  updated={platformChanged}
                />
              </div>
            </div>

            <ItineraryMapAction target={validatedFromLegName || ''} focusAction={focusAction} />
          </div>

          <LegInfo
            leg={leg}
            hasNoShortName={hasNoShortName}
            headsign={headsign}
            alertSeverityLevel={alertSeverityLevel}
            isAlternativeLeg={false}
            displayTime={displayAlternativeLegs}
            changeHash={changeHash}
            tabIndex={tabIndex}
            isCallAgency={isCallAgency}
            mobile={mobile}
            isTransitLeg
          />

          {showAlternativeLegs &&
            !isRouteConstantOperation &&
            leg.nextLegs.map(l => (
              <LegInfo
                key={`${l.trip.gtfsId}-${legTime(l.start)}`}
                leg={l}
                hasNoShortName={hasNoShortName}
                headsign={getLegHeadsign(l)}
                isAlternativeLeg
                alertSeverityLevel={getActiveLegAlertSeverityLevel(l)}
                displayTime
                isCallAgency={isCallAgency}
                mobile={mobile}
                isTransitLeg
              />
            ))}

          {displayAlternativeLegs && (
            <AlternativeLegsInfo
              legs={filterNextLegs(leg)}
              showAlternativeLegs={showAlternativeLegs}
              toggle={() => setShowAlternativeLegs(prev => !prev)}
            />
          )}

          {(alertSeverityLevel === AlertSeverityLevelType.Warning ||
            alertSeverityLevel === AlertSeverityLevelType.Severe ||
            alertSeverityLevel === AlertSeverityLevelType.Unknown) && (
            <div className="disruption disruption-link-container">
              <Link
                to={
                  (hasEntitiesOfType(alert, AlertEntityType.Route) &&
                    routePagePath(leg.route.gtfsId, PREFIX_DISRUPTION, leg.trip.pattern.code)) ||
                  (hasEntitiesOfType(alert, AlertEntityType.Stop) &&
                    stopPagePath(false, alert.entities[0].gtfsId, PREFIX_DISRUPTION))
                }
                className="disruption-link"
              >
                <div className="disruption-icon">
                  <ServiceAlertIcon className="inline-icon" severityLevel={alertSeverityLevel} />
                </div>
                <div className="description">
                  {config.showAlertHeader ? alert.alertHeaderText : alert.alertDescriptionText}
                </div>
                <Icon
                  img="icon_arrow-collapse--right"
                  className="disruption-link-arrow"
                  color={config.colors.primary}
                />
              </Link>
            </div>
          )}

          {interliningLegs.length > 0 ? (
            <InterlineInfo
              legs={interliningLegs}
              leg={leg}
              usingOwnCarWholeTrip={usingOwnCarWholeTrip}
            />
          ) : (
            !omitDivider &&
            routeNotifications.length === 0 &&
            intermediateStopCount > 1 && <div className="divider" />
          )}

          {routeNotifications}

          <LegAgencyInfo leg={leg} />
          {children}
          {intermediateStopCount > 1 && (
            <div className="intermediate-stops-button-container">
              {(leg.intermediatePlaces.length >= 2 || interliningLegs.length >= 2) && (
                <StopInfo
                  toggleFunction={toggleShowIntermediateStops}
                  leg={leg}
                  intermediateStopCount={intermediateStopCount}
                  duration={
                    interliningLegs.length > 0
                      ? legTime(interliningLegs[interliningLegs.length - 1].end) -
                        legTime(leg.start)
                      : leg.duration * 1000
                  }
                  showIntermediateStops={showIntermediateStops}
                />
              )}
            </div>
          )}
          <LegFareDisclaimer leg={leg} mode={mode} />
        </div>

        <span className="sr-only">{alertSeverityDescription}</span>
      </div>

      {showIntermediateStops && (
        <IntermediateStops
          leg={leg}
          interliningLegs={interliningLegs}
          mode={mode}
          color={routeColor}
          canceledStopIds={canceledStopIds}
        />
      )}
    </>
  );
}

TransitLeg.propTypes = {
  leg: legShape.isRequired,
  interliningLegs: PropTypes.arrayOf(legShape),
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node,
  omitDivider: PropTypes.bool,
  changeHash: PropTypes.func,
  tabIndex: PropTypes.number,
  usingOwnCarWholeTrip: PropTypes.bool,
  mobile: PropTypes.bool,
};
