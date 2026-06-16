import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import LegAgencyInfo from './LegAgencyInfo';
import Icon from '../Icon';
import IntermediateLeg from './IntermediateLeg';
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
  tripHasCancelationForStop,
} from '../../util/alertUtils';
import {
  PREFIX_DISRUPTION,
  routePagePath,
  stopPagePath,
} from '../../util/path';
import { durationToString } from '../../util/timeUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import {
  getHeadsignFromRouteLongName,
  getStopHeadsignFromStoptimes,
  getZoneLabel,
  showBikeBoardingNote,
  showCarBoardingNote,
  legTimeStr,
  legTime,
  isPlatformChanged,
  getValidatedLegName,
  isLocalCallAgency,
} from '../../util/legUtils';
import { shouldShowFareInfo } from '../../util/fareUtils';
import { AlertEntityType, AlertSeverityLevelType } from '../../constants';
import { legShape } from '../../util/shapes';
import ZoneIcon from '../ZoneIcon';
import StopInfo from './StopInfo';
import InterlineInfo from './InterlineInfo';
import AlternativeLegsInfo from './AlternativeLegsInfo';
import LegInfo from './LegInfo';
import ExternalLink from '../ExternalLink';
import { getBoardingInformationText } from './BoardingInformation';
import { getTrackOrPierOrPlatformChangeText } from '../../util/modeUtils';
import { useConfigContext } from '../../configurations/ConfigContext';
import { splitGtfsId } from '../../util/gtfs';

const stopCode = code => code && <StopCode code={code} />;

/**
 * Some next legs might be for example 24h in the future which seems confusing.
 * Only show alternatives that are less than 12h in the future.
 */
const filterNextLegs = l => {
  if (!l.nextLegs) {
    return [];
  }
  return l.nextLegs.filter(
    nextLeg => legTime(nextLeg.start) - legTime(l.start) < 12 * 3600 * 1000,
  );
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
  const { language } = config;

  const [showIntermediateStops, setShowIntermediateStops] = useState(() => {
    if (interliningLegs.length >= 1) {
      return (
        interliningLegs.reduce(
          (sum, l) => sum + l.intermediatePlaces.length,
          0,
        ) < 2
      );
    }
    return leg.intermediatePlaces.length < 2;
  });

  const [showAlternativeLegs, setShowAlternativeLegs] = useState(false);

  const isRouteConstantOperation =
    config.constantOperationRoutes?.[leg.route.gtfsId];

  const displayAlternativeLegs =
    config.showAlternativeLegs &&
    filterNextLegs(leg).length > 0 &&
    !isRouteConstantOperation;

  const toggleShowIntermediateStops = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: showIntermediateStops
        ? 'HideIntermediateStops'
        : 'ShowIntermediateStops',
      name: null,
    });

    setShowIntermediateStops(prevState => !prevState);
  };

  const getZoneChange = () => {
    const startZone = leg.from.stop.zoneId;
    const endZone = leg.to.stop.zoneId;

    const { feedId } = splitGtfsId(leg.from.stop.gtfsId);
    const renderZoneIcons =
      config.zones.itinerary &&
      leg.from.stop.gtfsId &&
      config.feedIds.includes(feedId);

    if (
      startZone !== endZone &&
      (!showIntermediateStops || leg.intermediatePlaces.length === 0) &&
      renderZoneIcons
    ) {
      return (
        <div className="time-column-zone-icons-container">
          <ZoneIcon zoneId={getZoneLabel(startZone, config)} showUnknown />
          <ZoneIcon
            zoneId={getZoneLabel(endZone, config)}
            className="zone-delimiter"
            showUnknown
          />
        </div>
      );
    }

    if (startZone === endZone && renderZoneIcons) {
      return (
        <div className="time-column-zone-icons-container single">
          <ZoneIcon zoneId={getZoneLabel(startZone, config)} showUnknown />
        </div>
      );
    }

    return null;
  };

  const renderIntermediate = () => {
    if (
      (leg.intermediatePlaces.length > 0 || interliningLegs.length > 0) &&
      showIntermediateStops === true
    ) {
      const places = leg.intermediatePlaces.slice();

      if (interliningLegs) {
        let previousLeg = leg;
        interliningLegs.forEach(iLeg => {
          places.push(
            { ...previousLeg.to, arrival: previousLeg.end },
            ...iLeg.intermediatePlaces,
          );
          previousLeg = iLeg;
        });
      }

      const stopList = places.map((place, i, array) => {
        const isFirstPlace = i === 0;
        const isLastPlace = i === array.length - 1;
        const isCanceled = tripHasCancelationForStop(leg.trip, place.stop);

        const previousZoneId =
          (array[i - 1] && array[i - 1].stop.zoneId) ||
          (isFirstPlace && leg.from.stop.zoneId);
        const currentZoneId = place.stop.zoneId;
        const nextZoneId =
          (array[i + 1] && array[i + 1].stop.zoneId) ||
          (isLastPlace &&
            interliningLegs[interliningLegs.length - 1]?.to.stop.zoneId) ||
          leg.to.stop.zoneId;

        const previousZoneIdDiffers =
          previousZoneId && previousZoneId !== currentZoneId;
        const nextZoneIdDiffers = nextZoneId && nextZoneId !== currentZoneId;
        const showCurrentZoneId = previousZoneIdDiffers || nextZoneIdDiffers;

        return (
          <IntermediateLeg
            placesCount={places.length}
            color={leg.route?.color ? `#${leg.route.color}` : undefined}
            key={place.stop.gtfsId}
            gtfsId={place.stop.gtfsId}
            mode={mode}
            name={place.stop.name}
            arrival={place.arrival}
            realTime={leg.realTime}
            stopCode={place.stop.code}
            showZoneLimits={config.zones.itinerary}
            showCurrentZoneDelimiter={previousZoneIdDiffers}
            previousZoneId={
              (isFirstPlace &&
                previousZoneIdDiffers &&
                getZoneLabel(previousZoneId, config)) ||
              undefined
            }
            currentZoneId={
              (showCurrentZoneId && getZoneLabel(currentZoneId, config)) ||
              undefined
            }
            nextZoneId={
              (isLastPlace &&
                nextZoneIdDiffers &&
                getZoneLabel(nextZoneId, config)) ||
              undefined
            }
            isViaPoint={place.isViaPoint}
            isLastPlace={isLastPlace}
            isCanceled={isCanceled}
          />
        );
      });

      return <div className="itinerary-leg-container">{stopList}</div>;
    }

    return null;
  };

  const renderFareDisclaimer = () => {
    if (
      leg.fare?.isUnknown &&
      !config.hideUnknownFares &&
      shouldShowFareInfo(config)
    ) {
      const modeDisclaimer = config.modeDisclaimers?.[mode]?.[language];
      if (modeDisclaimer) {
        return (
          <div className="disclaimer-container unknown-fare-disclaimer__leg description-container">
            {modeDisclaimer.disclaimer}
            <a href={modeDisclaimer.link} target="_blank" rel="noreferrer">
              {modeDisclaimer.text}
            </a>
          </div>
        );
      }

      if (mode !== 'call') {
        return (
          <div className="disclaimer-container unknown-fare-disclaimer__leg">
            <div className="description-container">
              <span className="accent">
                <FormattedMessage id="pay-attention" />
              </span>
              <FormattedMessage id="separate-ticket-required" />
            </div>
            <div className="ticket-info">
              <div className="accent">
                {leg.from.name.concat(' - ').concat(leg.to.name)}
              </div>
              {leg.fare.agency &&
                !config.hideExternalOperator(leg.fare.agency) && (
                  <>
                    {leg.fare.agency.name}
                    {leg.fare.agency.fareUrl && (
                      <ExternalLink
                        className="agency-link"
                        href={leg.fare.agency.fareUrl}
                      >
                        <FormattedMessage id="extra-info" />
                      </ExternalLink>
                    )}
                  </>
                )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const startMs = legTime(leg.start);
  const time = legTimeStr(leg.start);
  const modeClassName = mode.toLowerCase();
  const validatedFromLegName = getValidatedLegName(leg.from.name, intl, true);
  const validatedToLegName = getValidatedLegName(leg.to.name, intl, false);

  const textVersionBeforeLink = (
    <FormattedMessage
      id="itinerary-details.transit-leg-part-1"
      values={{
        time,
        realtime: leg.realTime ? intl.formatMessage({ id: 'realtime' }) : '',
      }}
    />
  );

  const platformChanged = isPlatformChanged(leg);

  const textVersionAfterLink = (
    <>
      <FormattedMessage
        id="itinerary-details.transit-leg-part-2"
        values={{
          startStop: validatedFromLegName,
          startZoneInfo: intl.formatMessage(
            { id: 'zone-info' },
            { zone: leg.from.stop.zoneId },
          ),
          endZoneInfo: intl.formatMessage(
            { id: 'zone-info' },
            { zone: leg.to.stop.zoneId },
          ),
          endStop: validatedToLegName,
          duration: durationToString(intl, leg.duration * 1000),
          trackInfo: getBoardingInformationText(leg, intl, false),
        }}
      />
      {platformChanged && getTrackOrPierOrPlatformChangeText(intl, mode)}
    </>
  );

  const alerts = getActiveLegAlerts(leg, startMs / 1000);
  const alert =
    alerts && alerts.length > 0
      ? alerts.sort(alertSeverityCompare)[0]
      : undefined;
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

  const zoneIcons = getZoneChange();

  const hasNoShortName =
    leg.route.shortName &&
    /^([^0-9]*)$/.test(leg.route.shortName) &&
    leg.route.shortName.length > 3;

  const headsign =
    getStopHeadsignFromStoptimes(leg.from.stop, leg.trip.stoptimesForDate) ||
    leg.trip.tripHeadsign ||
    getHeadsignFromRouteLongName(leg.route);

  let intermediateStopCount = leg.intermediatePlaces.length;
  if (interliningLegs) {
    intermediateStopCount = interliningLegs.reduce(
      (prev, curr) => prev + curr.intermediatePlaces.length + 1,
      leg.intermediatePlaces.length,
    );
  }

  const { showBikeBoardingInformation, showCarBoardingInformation } = leg;

  const createNotification = notification => (
    <>
      <div className="disruption-icon notification-icon">
        <ServiceAlertIcon
          className="inline-icon"
          severityLevel={AlertSeverityLevelType.Info}
        />
      </div>
      <div
        className={cx('info-notification', {
          'no-header': !notification.header,
        })}
      >
        {notification.header && (
          <h3 className="info-header">{notification.header[language]}</h3>
        )}
        <div
          className={cx('info-content', { 'no-header': !notification.header })}
        >
          {notification.content[language].join(' ')}
        </div>
      </div>
    </>
  );

  const createNotificationWithLink = notification => (
    <a
      href={`https://www.${notification.link?.[language]}`}
      className="disruption-link"
      target="_blank"
      rel="noreferrer"
    >
      {createNotification(notification)}
      <Icon
        img="icon_arrow-collapse--right"
        className="disruption-link-arrow"
        color={config.colors.primary}
      />
    </a>
  );

  const routeNotifications = [];
  const isCallAgency = mode === 'call';

  if (
    process.env.NODE_ENV !== 'test' &&
    config.routeNotifications &&
    config.routeNotifications.length > 0
  ) {
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
            key={`note-${index}`}
          >
            {notification.link
              ? createNotificationWithLink(notification)
              : createNotification(notification)}
          </div>,
        );
      }
    }
  }

  return (
    <>
      <div key={index} className="row itinerary-row">
        <span className="sr-only">{textVersionBeforeLink}</span>
        <div className="small-2 columns itinerary-time-column">
          <span className="sr-only">
            <FormattedMessage
              id={`${mode}-with-route-number`}
              values={{
                routeNumber: leg.route?.shortName,
                headSign: leg.trip?.tripHeadsign,
              }}
              defaultMessage={`${mode} {routeNumber} {headSign}`}
            />
          </span>
          <span aria-hidden="true">
            <div className="itinerary-time-column-time">
              {isCallAgency && <FormattedMessage id="estimate" />}{' '}
              <span className={cx({ realtime: leg.realTime })}>{time}</span>
            </div>
            {zoneIcons}
          </span>
        </div>

        <span className="sr-only">{textVersionAfterLink}</span>

        <ItineraryCircleLine
          index={index}
          modeClassName={modeClassName}
          color={leg.route?.color ? `#${leg.route.color}` : undefined}
          renderBottomMarker={
            !showIntermediateStops ||
            (leg.intermediatePlaces.length === 0 && interliningLegs.length < 1)
          }
          viaType={leg.from.viaLocationType}
          isStop={!!leg.from.stop}
          appendClass={isLocalCallAgency(leg, config) ? 'call-local' : ''}
        />

        <div
          style={{
            color: leg.route?.color ? `#${leg.route.color}` : undefined,
          }}
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

          <div
            className={cx('itinerary-leg-first-row', 'transit', {
              first: index === 0,
            })}
          >
            <div className="itinerary-leg-row">
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
                  <Icon
                    img="icon_mapMarker"
                    className="itinerary-mapmarker-icon"
                  />
                )}
                <Icon
                  img="icon_arrow-collapse--right"
                  className="itinerary-arrow-icon"
                  color={config.colors.primary}
                />
              </Link>

              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={getActiveAlertSeverityLevel(
                  leg.from.stop && leg.from.stop.alerts,
                  startMs / 1000,
                )}
              />

              <div className="stop-code-container">
                {stopCode(leg.from.stop && leg.from.stop.code)}
                <PlatformNumber
                  number={leg.from.stop.platformCode}
                  short
                  mode={mode}
                  updated={platformChanged}
                />
              </div>
            </div>

            <ItineraryMapAction
              target={validatedFromLegName || ''}
              focusAction={focusAction}
            />
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
                key={l.route.shortName + legTime(l.start)}
                leg={l}
                hasNoShortName={hasNoShortName}
                headsign={l.trip.tripHeadsign}
                isAlternativeLeg
                alertSeverityLevel={getActiveLegAlertSeverityLevel(
                  l,
                  l.start / 1000,
                )}
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
                    routePagePath(
                      leg.route.gtfsId,
                      PREFIX_DISRUPTION,
                      leg.trip.pattern.code,
                    )) ||
                  (hasEntitiesOfType(alert, AlertEntityType.Stop) &&
                    stopPagePath(
                      false,
                      alert.entities[0].gtfsId,
                      PREFIX_DISRUPTION,
                    ))
                }
                className="disruption-link"
              >
                <div className="disruption-icon">
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={alertSeverityLevel}
                  />
                </div>
                <div className="description">
                  {config.showAlertHeader
                    ? alert.alertHeaderText
                    : alert.alertDescriptionText}
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
              {(leg.intermediatePlaces.length >= 2 ||
                interliningLegs.length >= 2) && (
                <StopInfo
                  toggleFunction={toggleShowIntermediateStops}
                  leg={leg}
                  intermediateStopCount={intermediateStopCount}
                  duration={
                    interliningLegs.length > 0
                      ? legTime(
                          interliningLegs[interliningLegs.length - 1].end,
                        ) - legTime(leg.start)
                      : leg.duration * 1000
                  }
                  showIntermediateStops={showIntermediateStops}
                />
              )}
            </div>
          )}
          {renderFareDisclaimer()}
        </div>

        <span className="sr-only">{alertSeverityDescription}</span>
      </div>

      {renderIntermediate()}
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
