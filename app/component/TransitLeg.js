import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import connectToStores from 'fluxible-addons-react/connectToStores';

import ExternalLink from './ExternalLink';
import LegAgencyInfo from './LegAgencyInfo';
import Icon from './Icon';
import IntermediateLeg from './IntermediateLeg';
import ItineraryCircleLine from './ItineraryCircleLine';
import PlatformNumber from './PlatformNumber';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import StopCode from './StopCode';
import {
  getActiveAlertSeverityLevel,
  tripHasCancelationForStop,
  getActiveLegAlerts,
  alertSeverityCompare,
  getMaximumAlertSeverityLevel,
} from '../util/alertUtils';
import { PREFIX_ROUTES, PREFIX_STOPS, PREFIX_DISRUPTION } from '../util/path';
import { durationToString } from '../util/timeUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { getZoneLabel, getHeadsignFromRouteLongName } from '../util/legUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import { shouldShowFareInfo } from '../util/fareUtils';
import { AlertSeverityLevelType } from '../constants';
import ZoneIcon from './ZoneIcon';
import StopInfo from './StopInfo';
import DelayedTime from './DelayedTime';

class TransitLeg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIntermediateStops: false,
    };
  }

  stopCode = stopCode => stopCode && <StopCode code={stopCode} />;

  toggleShowIntermediateStops = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: this.state.showIntermediateStops
        ? 'HideIntermediateStops'
        : 'ShowIntermediateStops',
      name: null,
    });

    this.setState(prevState => ({
      showIntermediateStops: !prevState.showIntermediateStops,
    }));
  };

  getZoneChange() {
    const { leg, nextInterliningLeg } = this.props;
    const startZone = leg.from.stop?.zoneId;
    const endZone = nextInterliningLeg?.to?.stop?.zoneId || leg.to.stop.zoneId;
    if (
      startZone !== endZone &&
      !this.state.showIntermediateStops &&
      this.context.config.zones.itinerary &&
      leg.from.stop.gtfsId &&
      this.context.config.feedIds.includes(leg.from.stop.gtfsId.split(':')[0])
    ) {
      return (
        <div className="time-column-zone-icons-container">
          <ZoneIcon
            zoneId={getZoneLabel(startZone, this.context.config)}
            showUnknown
          />
          <ZoneIcon
            zoneId={getZoneLabel(endZone, this.context.config)}
            className="zone-delimiter"
            showUnknown
          />
        </div>
      );
    }
    if (
      startZone === endZone &&
      this.context.config.zones.itinerary &&
      leg.from.stop.gtfsId &&
      this.context.config.feedIds.includes(leg.from.stop.gtfsId.split(':')[0])
    ) {
      return (
        <div className="time-column-zone-icons-container single">
          <ZoneIcon
            zoneId={getZoneLabel(startZone, this.context.config)}
            showUnknown
          />
        </div>
      );
    }
    return null;
  }

  renderIntermediate() {
    const { leg, mode, nextInterliningLeg } = this.props;
    if (
      leg.intermediatePlaces.length > 0 &&
      this.state.showIntermediateStops === true
    ) {
      const places = leg.intermediatePlaces.slice();
      if (this.props.nextInterliningLeg) {
        places.push(
          { ...leg.to, arrivalTime: leg.endTime },
          ...this.props.nextInterliningLeg.intermediatePlaces,
        );
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
          (isLastPlace && nextInterliningLeg?.to?.stop.zoneId) ||
          leg.to.stop.zoneId;
        const previousZoneIdDiffers =
          previousZoneId && previousZoneId !== currentZoneId;
        const nextZoneIdDiffers = nextZoneId && nextZoneId !== currentZoneId;
        const showCurrentZoneId = previousZoneIdDiffers || nextZoneIdDiffers;
        return (
          <IntermediateLeg
            color={leg.route ? `#${leg.route.color}` : 'currentColor'}
            key={place.stop.gtfsId}
            gtfsId={place.stop.gtfsId}
            mode={mode}
            name={place.stop.name}
            arrivalTime={place.arrivalTime}
            realTime={leg.realTime}
            stopCode={place.stop.code}
            focusFunction={this.context.focusFunction({
              lat: place.stop.lat,
              lon: place.stop.lon,
            })}
            showZoneLimits={this.context.config.zones.itinerary}
            showCurrentZoneDelimiter={previousZoneIdDiffers}
            previousZoneId={
              (isFirstPlace &&
                previousZoneIdDiffers &&
                getZoneLabel(previousZoneId, this.context.config)) ||
              undefined
            }
            currentZoneId={
              (showCurrentZoneId &&
                getZoneLabel(currentZoneId, this.context.config)) ||
              undefined
            }
            nextZoneId={
              (isLastPlace &&
                nextZoneIdDiffers &&
                getZoneLabel(nextZoneId, this.context.config)) ||
              undefined
            }
            isLastPlace={isLastPlace}
            isCanceled={isCanceled}
          />
        );
      });
      return <div className="itinerary-leg-container">{stopList}</div>;
    }
    return null;
  }

  renderMain = () => {
    const {
      children,
      focusAction,
      index,
      leg,
      mode,
      lang,
      nextInterliningLeg,
      omitDivider,
    } = this.props;
    const { config, intl } = this.context;

    const LegRouteName = leg.from.name?.concat(' - ').concat(leg.to.name);
    const modeClassName = mode.toLowerCase();

    const textVersionBeforeLink = (
      <FormattedMessage
        id="itinerary-details.transit-leg-part-1"
        values={{
          time: moment(leg.startTime).format('HH:mm'),
        }}
      />
    );
    const textVersionAfterLink = (
      <FormattedMessage
        id="itinerary-details.transit-leg-part-2"
        values={{
          vehicle: <>{children}</>,
          startStop: leg.from.name,
          startZoneInfo: intl.formatMessage(
            { id: 'zone-info' },
            { zone: leg.from.stop?.zoneId },
          ),
          endZoneInfo: intl.formatMessage(
            { id: 'zone-info' },
            { zone: leg.to.stop?.zoneId },
          ),
          endStop: leg.to.name,
          duration: durationToString(leg.duration * 1000),
          trackInfo: (
            <PlatformNumber
              number={leg.from.stop?.platformCode}
              short={false}
              isRailOrSubway={
                modeClassName === 'rail' || modeClassName === 'subway'
              }
            />
          ),
        }}
      />
    );

    const alerts = getActiveLegAlerts(leg, leg.startTime / 1000, lang); // legStartTime converted to ms format
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
    const zoneIcons = this.getZoneChange();
    // Checks if route only has letters without identifying numbers and
    // length doesn't fit in the tab view
    const hasNoShortName =
      leg.route.shortName &&
      new RegExp(/^([^0-9]*)$/).test(leg.route.shortName) &&
      leg.route.shortName.length > 3;

    const headsign =
      leg.trip.tripHeadsign || getHeadsignFromRouteLongName(leg.route);

    let intermediateStopCount = leg.intermediatePlaces.length;
    if (this.props.nextInterliningLeg) {
      intermediateStopCount +=
        this.props.nextInterliningLeg.intermediatePlaces.length + 1;
    }
    const isOnDemandTaxi = leg.route.type === 715;

    return (
      <div key={index} className="row itinerary-row">
        <span className="sr-only">{textVersionBeforeLink}</span>
        <div className="small-2 columns itinerary-time-column">
          <span className="sr-only">{children}</span>
          <span aria-hidden="true">
            <div className="itinerary-time-column-time">
              <DelayedTime
                leg={leg}
                delay={leg.departureDelay}
                startTime={leg.startTime}
              />
            </div>
            {zoneIcons}
          </span>
        </div>
        <span className="sr-only">{textVersionAfterLink}</span>
        <ItineraryCircleLine
          index={index}
          modeClassName={modeClassName}
          color={leg.route ? `#${leg.route.color}` : 'currentColor'}
          renderBottomMarker={!this.state.showIntermediateStops}
        />
        <div
          style={{
            color: leg.route ? `#${leg.route.color}` : 'currentColor',
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
              values={{ target: leg.from.name || '' }}
            />
          </span>
          <div
            className={cx('itinerary-leg-first-row', 'transit', {
              first: index === 0,
            })}
          >
            <div className="itinerary-leg-row">
              <Link
                onClick={e => {
                  e.stopPropagation();
                  addAnalyticsEvent({
                    category: 'Itinerary',
                    action: 'OpenRouteFromItinerary',
                    name: mode,
                  });
                }}
                to={`/${PREFIX_STOPS}/${leg.from.stop?.gtfsId}`}
              >
                {leg.from.name}
                <Icon
                  img="icon-icon_arrow-collapse--right"
                  className="itinerary-arrow-icon"
                  color={config.colors.primary}
                />
              </Link>
              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={getActiveAlertSeverityLevel(
                  leg.from.stop && leg.from.stop.alerts,
                  leg.startTime / 1000,
                )}
              />
              <div className="stop-code-container">
                {this.stopCode(leg.from.stop && leg.from.stop.code)}
                <PlatformNumber
                  number={leg.from.stop?.platformCode}
                  short
                  isRailOrSubway={
                    modeClassName === 'rail' || modeClassName === 'subway'
                  }
                />
              </div>
            </div>
            <div
              className="itinerary-map-action"
              onClick={focusAction}
              onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
              role="button"
              tabIndex="0"
              aria-label={intl.formatMessage(
                { id: 'itinerary-summary.show-on-map' },
                { target: leg.from.name || '' },
              )}
            >
              <Icon
                img="icon-icon_show-on-map"
                className="itinerary-search-icon"
              />
            </div>
          </div>
          <div
            className={cx('itinerary-transit-leg-route', {
              'long-name': hasNoShortName,
            })}
          >
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              to={
                `/${PREFIX_ROUTES}/${leg.route.gtfsId}/${PREFIX_STOPS}/${leg.trip.pattern?.code}/${leg.trip.gtfsId}`
                // TODO: Create a helper function for generationg links
              }
              aria-label={`${intl.formatMessage({
                id: mode.toLowerCase(),
                defaultMessage: 'Vehicle',
              })} ${leg.route && leg.route.shortName}`}
            >
              <span aria-hidden="true">
                <RouteNumber
                  mode={mode.toLowerCase()}
                  alertSeverityLevel={alertSeverityLevel}
                  color={leg.route ? `#${leg.route.color}` : 'currentColor'}
                  text={leg.route && leg.route.shortName}
                  realtime={false}
                  icon={
                    isOnDemandTaxi ? 'icon-icon_on-demand-taxi-white' : null
                  }
                  withBar
                  fadeLong
                />
              </span>
            </Link>
            <div className="headsign">{headsign}</div>
          </div>
          {leg.dropOffBookingInfo && (
            <div>
              <div className={`itinerary-alert-info ${mode.toLowerCase()}`}>
                <ServiceAlertIcon
                  className="inline-icon"
                  severityLevel={AlertSeverityLevelType.Info}
                />
                <div>
                  {leg.dropOffBookingInfo.message}{' '}
                  {leg.dropOffBookingInfo.dropOffMessage}
                </div>
                <div>
                  <a
                    href={leg.dropOffBookingInfo.contactInfo.infoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      id="extra-info"
                      defaultMessage="More information"
                    />
                  </a>
                </div>
              </div>
              {leg.dropOffBookingInfo.contactInfo.phoneNumber && (
                <div className="call-button">
                  <a
                    href={`tel:${leg.dropOffBookingInfo.contactInfo.phoneNumber}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage id="call" defaultMessage="Call" />{' '}
                    {leg.dropOffBookingInfo.contactInfo.phoneNumber}
                  </a>
                </div>
              )}
              {leg.dropOffBookingInfo.contactInfo.bookingUrl && (
                <div className="call-button">
                  <a
                    href={leg.dropOffBookingInfo.contactInfo.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      id="book-on-demand-taxi"
                      defaultMessage="book a ride"
                    />
                  </a>
                </div>
              )}
            </div>
          )}
          {(alertSeverityLevel === AlertSeverityLevelType.Warning ||
            alertSeverityLevel === AlertSeverityLevelType.Severe ||
            alertSeverityLevel === AlertSeverityLevelType.Unknown) && (
            <div className="disruption">
              <div className="disruption-link-container">
                <Link
                  to={
                    (alert.route &&
                      alert.route.gtfsId &&
                      `/${PREFIX_ROUTES}/${leg.route.gtfsId}/${PREFIX_DISRUPTION}/${leg.trip.pattern.code}`) ||
                    (alert.stop &&
                      alert.stop.gtfsId &&
                      `/${PREFIX_STOPS}/${alert.stop.gtfsId}/${PREFIX_DISRUPTION}/`)
                  }
                  className="disruption-link"
                >
                  <div className="disruption-icon">
                    <ServiceAlertIcon
                      className="inline-icon"
                      severityLevel={alertSeverityLevel}
                    />
                  </div>
                  {config.showAlertHeader ? (
                    <div className="description">{alert.header}</div>
                  ) : (
                    <div className="description">{alert.description}</div>
                  )}
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className="disruption-link-arrow"
                    color={config.colors.primary}
                  />
                </Link>
              </div>
            </div>
          )}
          {nextInterliningLeg ? (
            <div className="interline-info-container">
              <Icon img="icon-icon_wait" />
              <FormattedMessage
                id="itinerary-summary.interline-wait"
                values={{
                  shortName: (
                    <span className="bold">
                      {nextInterliningLeg.route.shortName}
                    </span>
                  ),
                  destination: (
                    <span className="bold">
                      {nextInterliningLeg.trip.tripHeadsign ||
                        getHeadsignFromRouteLongName(nextInterliningLeg.route)}
                    </span>
                  ),
                  stop: leg.to.name,
                  time: (
                    <span className="bold">
                      {durationToString(this.props.interliningWait)}
                    </span>
                  ),
                }}
              />
            </div>
          ) : (
            !omitDivider && <div className="divider" />
          )}
          <LegAgencyInfo leg={leg} />
          <div>
            <StopInfo
              toggleFunction={this.toggleShowIntermediateStops}
              leg={leg}
              intermediateStopCount={intermediateStopCount}
              duration={
                this.props.nextInterliningLeg
                  ? this.props.nextInterliningLeg.endTime - leg.startTime
                  : leg.duration * 1000
              }
              showIntermediateStops={this.state.showIntermediateStops}
            />
          </div>
          {leg.fare && leg.fare.isUnknown && shouldShowFareInfo(config) && (
            <div className="disclaimer-container unknown-fare-disclaimer__leg">
              <div className="description-container">
                <span className="accent">
                  {`${intl.formatMessage({ id: 'pay-attention' })} `}
                </span>
                {intl.formatMessage({ id: 'separate-ticket-required' })}
              </div>
              <div className="ticket-info">
                <div className="accent">{LegRouteName}</div>
                {leg.fare.agency &&
                  !config.hideExternalOperator(leg.fare.agency) && (
                    <React.Fragment>
                      <div>{leg.fare.agency.name}</div>
                      {leg.fare.agency.fareUrl && (
                        <ExternalLink
                          className="agency-link"
                          href={leg.fare.agency.fareUrl}
                        >
                          {intl.formatMessage({ id: 'extra-info' })}
                        </ExternalLink>
                      )}
                    </React.Fragment>
                  )}
              </div>
            </div>
          )}
        </div>
        <span className="sr-only">{alertSeverityDescription}</span>
      </div>
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.renderMain()}
        {this.renderIntermediate()}
      </React.Fragment>
    );
  }
}

TransitLeg.propTypes = {
  leg: PropTypes.shape({
    realtimeState: PropTypes.string,
    realTime: PropTypes.bool,
    fare: PropTypes.shape({
      isUnknown: PropTypes.bool,
      agency: PropTypes.shape({
        name: PropTypes.string,
        fareUrl: PropTypes.string,
      }),
    }),
    dropOffBookingInfo: PropTypes.shape({
      message: PropTypes.string,
      dropOffMessage: PropTypes.string,
      contactInfo: PropTypes.shape({
        phoneNumber: PropTypes.string,
        infoUrl: PropTypes.string,
        bookingUrl: PropTypes.string,
      }),
    }),
    from: PropTypes.shape({
      stop: PropTypes.shape({
        code: PropTypes.string,
        platformCode: PropTypes.string,
        zoneId: PropTypes.string,
        alerts: PropTypes.array,
        gtfsId: PropTypes.string,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    duration: PropTypes.number.isRequired,
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      shortName: PropTypes.string,
      color: PropTypes.string,
      alerts: PropTypes.array,
      type: PropTypes.number,
    }).isRequired,
    to: PropTypes.shape({
      stop: PropTypes.shape({
        zoneId: PropTypes.string,
        alerts: PropTypes.array,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    trip: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }).isRequired,
      tripHeadsign: PropTypes.string.isRequired,
    }).isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number,
    departureDelay: PropTypes.number,
    intermediatePlaces: PropTypes.arrayOf(
      PropTypes.shape({
        arrivalTime: PropTypes.number.isRequired,
        stop: PropTypes.shape({
          gtfsId: PropTypes.string.isRequired,
          code: PropTypes.string,
          platformCode: PropTypes.string,
          zoneId: PropTypes.string,
        }).isRequired,
      }),
    ).isRequired,
    interlineWithPreviousLeg: PropTypes.bool.isRequired,
  }).isRequired,
  nextInterliningLeg: PropTypes.shape({
    intermediatePlaces: PropTypes.arrayOf(
      PropTypes.shape({
        arrivalTime: PropTypes.number.isRequired,
        stop: PropTypes.shape({
          gtfsId: PropTypes.string.isRequired,
          code: PropTypes.string,
          platformCode: PropTypes.string,
          zoneId: PropTypes.string,
        }).isRequired,
      }),
    ).isRequired,
    route: PropTypes.shape({
      shortName: PropTypes.string,
    }).isRequired,
    trip: PropTypes.shape({
      tripHeadsign: PropTypes.string.isRequired,
    }).isRequired,
    endTime: PropTypes.number.isRequired,
    to: PropTypes.shape({
      stop: PropTypes.shape({
        zoneId: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }),
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  interliningWait: PropTypes.number,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  lang: PropTypes.string.isRequired,
  omitDivider: PropTypes.bool,
};

TransitLeg.defaultProps = {
  omitDivider: false,
};

TransitLeg.contextTypes = {
  focusFunction: PropTypes.func.isRequired,
  config: PropTypes.shape({
    itinerary: PropTypes.shape({
      delayThreshold: PropTypes.number,
    }).isRequired,
    showTicketInformation: PropTypes.bool,
  }).isRequired,
  intl: intlShape.isRequired,
};

const connectedComponent = connectToStores(
  TransitLeg,
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, TransitLeg as Component };
