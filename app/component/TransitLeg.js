import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'react-router';

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
  getActiveLegAlertSeverityLevel,
  legHasCancelation,
  tripHasCancelationForStop,
} from '../util/alertUtils';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { durationToString } from '../util/timeUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { getZoneLabelColor } from '../util/mapIconUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import { AlertSeverityLevelType } from '../constants';

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

  renderIntermediate() {
    const { leg, mode } = this.props;
    if (
      leg.intermediatePlaces.length > 0 &&
      this.state.showIntermediateStops === true
    ) {
      const stopList = leg.intermediatePlaces.map((place, i, array) => {
        const isFirstPlace = i === 0;
        const isLastPlace = i === array.length - 1;
        const isCanceled = tripHasCancelationForStop(leg.trip, place.stop);

        const previousZoneId =
          (array[i - 1] && array[i - 1].stop.zoneId) ||
          (isFirstPlace && leg.from.stop.zoneId);
        const currentZoneId = place.stop.zoneId;
        const nextZoneId =
          (array[i + 1] && array[i + 1].stop.zoneId) ||
          (isLastPlace && leg.to.stop.zoneId);

        const previousZoneIdDiffers =
          previousZoneId && previousZoneId !== currentZoneId;
        const nextZoneIdDiffers = nextZoneId && nextZoneId !== currentZoneId;
        const showCurrentZoneId = previousZoneIdDiffers || nextZoneIdDiffers;

        return (
          <IntermediateLeg
            color={leg.route ? `#${leg.route.color}` : 'currentColor'}
            key={place.stop.gtfsId}
            mode={mode}
            name={place.stop.name}
            arrivalTime={place.arrivalTime}
            realTime={leg.realTime}
            stopCode={place.stop.code}
            focusFunction={this.context.focusFunction({
              lat: place.stop.lat,
              lon: place.stop.lon,
            })}
            showZoneLimits={this.context.config.itinerary.showZoneLimits}
            showCurrentZoneDelimiter={previousZoneIdDiffers}
            previousZoneId={
              (isFirstPlace && previousZoneIdDiffers && previousZoneId) ||
              undefined
            }
            currentZoneId={(showCurrentZoneId && currentZoneId) || undefined}
            nextZoneId={
              (isLastPlace && nextZoneIdDiffers && nextZoneId) || undefined
            }
            isCanceled={isCanceled}
            zoneLabelColor={getZoneLabelColor(this.context.config)}
          />
        );
      });
      return <div className="itinerary-leg-container">{stopList}</div>;
    }
    return null;
  }

  renderMain = () => {
    const { children, focusAction, index, leg, mode } = this.props;
    const { config, intl } = this.context;

    const originalTime = leg.realTime &&
      leg.departureDelay &&
      leg.departureDelay >= config.itinerary.delayThreshold && [
        <br key="br" />,
        <span key="time" className="original-time">
          {moment(leg.startTime)
            .subtract(leg.departureDelay, 's')
            .format('HH:mm')}
        </span>,
      ];
    const LegRouteName = leg.from.name.concat(' - ').concat(leg.to.name);
    const firstLegClassName = index === 0 ? ' start' : '';
    /* const modeClassName =
      `${this.props.mode.toLowerCase()}${this.props.index === 0 ? ' from' : ''}`;
    */
    const modeClassName = mode.toLowerCase();
    const StopInfo = ({ stops, leg: stopLeg, toggleFunction }) => {
      const stopCount = (stops && stops.length) || 0;
      const message = (this.state.showIntermediateStops && (
        <FormattedMessage
          id="itinerary-hide-stops"
          defaultMessage="Hide stops"
        />
      )) || (
        <FormattedMessage
          id="number-of-intermediate-stops"
          values={{
            number: (stops && stops.length) || 0,
          }}
          defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
        />
      );

      return (
        <div className="intermediate-stop-info-container">
          {stopCount === 0 ? (
            <span className="intermediate-stop-no-stops">{message}</span>
          ) : (
            <span
              role="button"
              tabIndex="0"
              className="intermediate-stops-link pointer-cursor"
              onClick={e => {
                e.stopPropagation();
                toggleFunction();
              }}
              onKeyPress={e => {
                if (isKeyboardSelectionEvent(e)) {
                  e.stopPropagation();
                  toggleFunction();
                }
              }}
            >
              {message}
            </span>
          )}{' '}
          <span className="intermediate-stops-duration" aria-hidden="true">
            ({durationToString(stopLeg.duration * 1000)})
          </span>
        </div>
      );
    };

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
          endStop: leg.to.name,
          duration: durationToString(leg.duration * 1000),
          trackInfo: (
            <PlatformNumber
              number={leg.from.stop.platformCode}
              short={false}
              isRailOrSubway={
                modeClassName === 'rail' || modeClassName === 'subway'
              }
            />
          ),
        }}
      />
    );

    const alert = getActiveLegAlertSeverityLevel(leg);
    let alertDescription = null;
    if (alert) {
      let id;
      switch (alert) {
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
      alertDescription = <FormattedMessage id={id} />;
    }

    return (
      <div key={index} className="row itinerary-row">
        <span className="sr-only">{textVersionBeforeLink}</span>
        <div className="small-2 columns itinerary-time-column">
          <Link
            onClick={e => {
              e.stopPropagation();
              addAnalyticsEvent({
                category: 'Itinerary',
                action: 'OpenRouteFromItinerary',
                name: mode,
              });
            }}
            onKeyPress={e => {
              if (isKeyboardSelectionEvent(e)) {
                e.stopPropagation();
                addAnalyticsEvent({
                  category: 'Itinerary',
                  action: 'OpenRouteFromItinerary',
                  name: mode,
                });
              }
            }}
            to={
              `/${PREFIX_ROUTES}/${leg.route.gtfsId}/${PREFIX_STOPS}/${
                leg.trip.pattern.code
              }/${leg.trip.gtfsId}`
              // TODO: Create a helper function for generationg links
            }
          >
            <span className="sr-only">{children}</span>
            <span aria-hidden="true">
              <div className="itinerary-time-column-time">
                <span className={cx({ canceled: legHasCancelation(leg) })}>
                  {moment(leg.startTime).format('HH:mm')}
                </span>
                {originalTime}
              </div>
              <RouteNumber //  shouldn't this be a route number container instead???
                alertSeverityLevel={getActiveLegAlertSeverityLevel(leg)}
                mode={mode.toLowerCase()}
                color={leg.route ? `#${leg.route.color}` : 'currentColor'}
                text={leg.route && leg.route.shortName}
                gtfsId={leg.route.gtfsId}
                realtime={leg.realTime}
                vertical
                fadeLong
              />
            </span>
          </Link>
        </div>
        <span className="sr-only">{textVersionAfterLink}</span>
        <ItineraryCircleLine
          index={index}
          modeClassName={modeClassName}
          color={leg.route ? `#${leg.route.color}` : 'currentColor'}
        />
        <div
          style={{
            color: leg.route ? `#${leg.route.color}` : 'currentColor',
          }}
          onClick={focusAction}
          onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
          role="button"
          tabIndex="0"
          className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
        >
          <span className="sr-only">
            <FormattedMessage
              id="itinerary-summary.show-on-map"
              values={{ target: leg.from.name || '' }}
            />
          </span>
          <div className="itinerary-leg-first-row" aria-hidden="true">
            <div>
              {leg.from.name}
              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={getActiveAlertSeverityLevel(
                  leg.from.stop && leg.from.stop.alerts,
                  leg.startTime / 1000,
                )}
              />
              {this.stopCode(leg.from.stop && leg.from.stop.code)}
              <PlatformNumber
                number={leg.from.stop.platformCode}
                short={false}
                isRailOrSubway={
                  modeClassName === 'rail' || modeClassName === 'subway'
                }
              />
            </div>
            <Icon
              img="icon-icon_search-plus"
              className="itinerary-search-icon"
            />
          </div>
          <div className="itinerary-transit-leg-route" aria-hidden="true">
            {children}
          </div>
          <LegAgencyInfo leg={leg} />
          <div>
            <StopInfo
              toggleFunction={this.toggleShowIntermediateStops}
              leg={leg}
              stops={leg.intermediatePlaces}
            />
          </div>
          {leg.fare &&
            leg.fare.isUnknown &&
            config.showTicketInformation && (
              <div className="disclaimer-container unknown-fare-disclaimer__leg">
                <div className="description-container">
                  <span className="accent">
                    {`${intl.formatMessage({ id: 'pay-attention' })} `}
                  </span>
                  {intl.formatMessage({ id: 'separate-ticket-required' })}
                </div>
                <div className="ticket-info">
                  <div className="accent">{LegRouteName}</div>
                  {leg.fare.agency && (
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
        <span className="sr-only">{alertDescription}</span>
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
    from: PropTypes.shape({
      stop: PropTypes.shape({
        code: PropTypes.string,
        platformCode: PropTypes.string,
        zoneId: PropTypes.string,
      }).isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      shortName: PropTypes.string,
      color: PropTypes.string,
    }).isRequired,
    to: PropTypes.shape({
      stop: PropTypes.shape({
        zoneId: PropTypes.string,
      }).isRequired,
    }).isRequired,
    trip: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      pattern: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    startTime: PropTypes.number.isRequired,
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
  }).isRequired,
  index: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

TransitLeg.contextTypes = {
  focusFunction: PropTypes.func.isRequired,
  config: PropTypes.shape({
    itinerary: PropTypes.shape({
      delayThreshold: PropTypes.number,
      showZoneLimits: PropTypes.bool,
    }).isRequired,
    showTicketInformation: PropTypes.bool,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default TransitLeg;
