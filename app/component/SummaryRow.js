import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import LocalTime from './LocalTime';
import RelativeDuration from './RelativeDuration';
import RouteNumber from './RouteNumber';
import RouteNumberContainer from './RouteNumberContainer';
import { getActiveLegAlertSeverityLevel } from '../util/alertUtils';
import {
  getLegMode,
  compressLegs,
  getLegBadgeProps,
  isCallAgencyPickupType,
} from '../util/legUtils';
import { dateOrEmpty, isTomorrow } from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import { isKeyboardSelectionEvent } from '../util/browser';
import {
  BIKEAVL_UNKNOWN,
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
  getCityBikeNetworkId,
} from '../util/citybikes';

const Leg = ({
  mode,
  routeNumber,
  legLength,
  fitRouteNumber,
  renderModeIcons,
}) => {
  return (
    <div
      className={cx(
        'leg',
        mode.toLowerCase(),
        fitRouteNumber ? 'fit-route-number' : '',
        renderModeIcons ? 'render-icon' : '',
      )}
      style={{ '--width': `${legLength}%` }}
    >
      {routeNumber}
    </div>
  );
};

Leg.propTypes = {
  routeNumber: PropTypes.node.isRequired,
  legLength: PropTypes.number.isRequired,
  mode: PropTypes.string,
  fitRouteNumber: PropTypes.bool,
  renderModeIcons: PropTypes.bool,
};

export const RouteLeg = ({
  leg,
  large,
  intl,
  legLength,
  isTransitLeg,
  interliningWithRoute,
  fitRouteNumber,
  withBicycle,
}) => {
  const isCallAgency = isCallAgencyPickupType(leg);
  let routeNumber;
  if (isCallAgency) {
    const message = intl.formatMessage({
      id: 'pay-attention',
      defaultMessage: 'Pay Attention',
    });

    routeNumber = (
      <RouteNumber
        mode="call"
        text={message}
        className={cx('line', 'call')}
        vertical
        withBar
        isTransitLeg={isTransitLeg}
      />
    );
  } else {
    routeNumber = (
      <RouteNumberContainer
        alertSeverityLevel={getActiveLegAlertSeverityLevel(leg)}
        route={leg.route}
        className={cx('line', leg.mode.toLowerCase())}
        interliningWithRoute={interliningWithRoute}
        mode={leg.mode}
        vertical
        withBar
        isTransitLeg={isTransitLeg}
        withBicycle={withBicycle}
      />
    );
  }
  return (
    <Leg
      mode={leg.mode}
      routeNumber={routeNumber}
      large={large}
      legLength={legLength}
      fitRouteNumber={fitRouteNumber}
    />
  );
};

RouteLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  large: PropTypes.bool.isRequired,
  legLength: PropTypes.number.isRequired,
  fitRouteNumber: PropTypes.bool.isRequired,
  interliningWithRoute: PropTypes.number,
  isTransitLeg: PropTypes.bool,
  withBicycle: PropTypes.bool.isRequired,
};

RouteLeg.defaultProps = {
  isTransitLeg: true,
};

export const ModeLeg = (
  { leg, mode, large, legLength, duration, renderModeIcons, icon },
  { config },
) => {
  let networkIcon;
  if (
    (mode === 'CITYBIKE' || mode === 'BICYCLE') &&
    leg.from.bikeRentalStation
  ) {
    networkIcon =
      leg.from.bikeRentalStation &&
      getCityBikeNetworkIcon(
        getCityBikeNetworkConfig(
          leg.from.bikeRentalStation.networks[0],
          config,
        ),
      );
  }
  const routeNumber = (
    <RouteNumber
      mode={mode}
      text=""
      className={cx('line', mode.toLowerCase())}
      duration={duration}
      renderModeIcons={renderModeIcons}
      vertical
      withBar
      icon={networkIcon || icon}
      {...getLegBadgeProps(leg, config)}
    />
  );
  return (
    <Leg
      mode={mode}
      routeNumber={routeNumber}
      renderModeIcons={renderModeIcons}
      large={large}
      legLength={legLength}
    />
  );
};

ModeLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  large: PropTypes.bool.isRequired,
  legLength: PropTypes.number.isRequired,
  renderModeIcons: PropTypes.bool,
  duration: PropTypes.number,
  icon: PropTypes.string,
};

ModeLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

export const ViaLeg = () => (
  <div className="leg via">
    <Icon img="icon-icon_mapMarker-via" className="itinerary-icon place" />
  </div>
);

const getViaPointIndex = (leg, intermediatePlaces) => {
  if (!leg || !Array.isArray(intermediatePlaces)) {
    return -1;
  }
  return intermediatePlaces.findIndex(
    place => place.lat === leg.from.lat && place.lon === leg.from.lon,
  );
};

const connectsFromViaPoint = (currLeg, intermediatePlaces) =>
  getViaPointIndex(currLeg, intermediatePlaces) > -1;

const bikeWasParked = legs => {
  const legsLength = legs.length;
  for (let i = 0; i < legsLength; i++) {
    if (legs[i].to && legs[i].to.bikePark) {
      return i;
    }
  }
  return legs.length;
};

const SummaryRow = (
  { data, breakpoint, intermediatePlaces, zones, ...props },
  { intl, intl: { formatMessage }, config, context },
) => {
  const isTransitLeg = leg => leg.transitLeg;
  const isLegOnFoot = leg => leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK';
  const usingOwnBicycle = data.legs.some(
    leg => getLegMode(leg) === 'BICYCLE' && leg.rentedBike === false,
  );
  const usingOwnBicycleWholeTrip =
    usingOwnBicycle && data.legs.every(leg => !leg.to || !leg.to.bikePark);
  const refTime = moment(props.refTime);
  const startTime = moment(data.startTime);
  const endTime = moment(data.endTime);
  const duration = endTime.diff(startTime);
  const isLate = leg =>
    leg.realTime &&
    leg.departureDelay !== undefined &&
    leg.departureDelay >= props.delayThreshold;

  const mobile = bp => !(bp === 'large');
  const legs = [];
  let noTransitLegs = true;
  const compressedLegs = compressLegs(data.legs).map(leg => ({
    ...leg,
  }));
  let intermediateSlack = 0;
  let transitLegCount = 0;
  compressedLegs.forEach((leg, i) => {
    if (isTransitLeg(leg)) {
      noTransitLegs = false;
      transitLegCount += 1;
    }
    if (
      leg.intermediatePlace ||
      connectsFromViaPoint(leg, intermediatePlaces)
    ) {
      intermediateSlack += leg.startTime - compressedLegs[i - 1].endTime; // calculate time spent at each intermediate place
    }
  });
  const durationWithoutSlack = duration - intermediateSlack; // don't include time spent at intermediate places in calculations for bar lengths
  let renderBarThreshold = 6;
  const renderRouteNumberThreshold = 12; // route numbers will be rendered on legs that are longer than this
  if (breakpoint === 'small') {
    renderBarThreshold = 8.5;
  }
  let firstLegStartTime = null;
  const vehicleNames = [];
  const stopNames = [];
  let addition = 0;
  let onlyIconLegs = 0; // keep track of legs that are too short to have a bar
  const onlyIconLegsLength = 0;
  const waitThreshold = 180000;
  const lastLeg = compressedLegs[compressedLegs.length - 1];
  const lastLegLength =
    ((lastLeg.duration * 1000) / durationWithoutSlack) * 100;
  const fitAllRouteNumbers = transitLegCount < 4; // if there are three or fewer transit legs, we will show all the route numbers.
  const bikeParkedIndex = usingOwnBicycle
    ? bikeWasParked(compressedLegs)
    : undefined;
  const renderModeIcons = compressedLegs.length < 10;
  let bikeNetwork;
  let showRentalBikeDurationWarning = false;
  const citybikeNetworks = new Set();
  let citybikeicon;

  compressedLegs.forEach((leg, i) => {
    let interliningWithRoute;
    let renderBar = true;
    let waiting = false;
    let waitTime;
    let waitLength;
    const isNextLegLast = i + 1 === compressedLegs.length - 1;
    const shouldRenderLastLeg =
      isNextLegLast && lastLegLength < renderBarThreshold;
    const previousLeg = compressedLegs[i - 1];
    const nextLeg = compressedLegs[i + 1];
    let legLength =
      ((leg.endTime - leg.startTime) / durationWithoutSlack) * 100; // length of the current leg in %

    const longName =
      leg.route && leg.route.shortName && leg.route.shortName.length > 5;

    if (
      nextLeg &&
      !nextLeg.intermediatePlace &&
      !connectsFromViaPoint(nextLeg, intermediatePlaces)
    ) {
      // don't show waiting in intermediate places
      waitTime = nextLeg.startTime - leg.endTime;
      waitLength = (waitTime / durationWithoutSlack) * 100;
      if (waitTime > waitThreshold && waitLength > renderBarThreshold) {
        // if waittime is long enough, render a waiting bar
        waiting = true;
      } else {
        legLength =
          ((leg.endTime - leg.startTime + waitTime) / durationWithoutSlack) *
          100; // otherwise add the waiting to the current legs length
      }
    }

    if (nextLeg?.interlineWithPreviousLeg) {
      interliningWithRoute = nextLeg.route.shortName;
      legLength =
        ((nextLeg.endTime - leg.startTime) / durationWithoutSlack) * 100;
    }
    legLength += addition;
    addition = 0;

    if (shouldRenderLastLeg) {
      legLength += lastLegLength; // if the last leg is too short add its length to the leg before it
    }
    if (legLength < renderBarThreshold && isLegOnFoot(leg)) {
      // don't render short legs that are on foot at all
      renderBar = false;
      addition += legLength; // carry over the length of the leg to the next
    }
    if (leg.intermediatePlace) {
      onlyIconLegs += 1;
      legs.push(<ViaLeg key={`via_${leg.mode}_${leg.startTime}`} />);
    }
    if (isLegOnFoot(leg) && renderBar) {
      const walkingTime = Math.floor(leg.duration / 60);
      let walkMode = 'walk';
      if (usingOwnBicycle && i < bikeParkedIndex) {
        walkMode = 'bicycle_walk';
      }
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          renderModeIcons={renderModeIcons}
          isTransitLeg={false}
          leg={leg}
          duration={walkingTime}
          mode={walkMode}
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
      if (leg.to.bikePark) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg bike_park"
            key={`${leg.mode}_${leg.startTime}_bike_park_indicator`}
          >
            <Icon
              img="icon-bike_parking"
              className="itinerary-icon bike_park"
            />
          </div>,
        );
      }
    } else if (
      (leg.mode === 'CITYBIKE' || leg.mode === 'BICYCLE') &&
      leg.rentedBike
    ) {
      const bikingTime = Math.floor((leg.endTime - leg.startTime) / 1000 / 60);
      // eslint-disable-next-line prefer-destructuring
      bikeNetwork = getCityBikeNetworkId(leg.from.bikeRentalStation.networks);
      if (
        config.cityBike.networks &&
        config.cityBike.networks[bikeNetwork]?.timeBeforeSurcharge &&
        config.cityBike.networks[bikeNetwork]?.durationInstructions
      ) {
        const rentDurationOverSurchargeLimit =
          leg.duration >
          config.cityBike?.networks[bikeNetwork].timeBeforeSurcharge;
        if (rentDurationOverSurchargeLimit) {
          citybikeNetworks.add(bikeNetwork);
        }
        showRentalBikeDurationWarning =
          showRentalBikeDurationWarning || rentDurationOverSurchargeLimit;
        if (!citybikeicon) {
          citybikeicon = getCityBikeNetworkIcon(
            getCityBikeNetworkConfig(getCityBikeNetworkId(bikeNetwork), config),
          );
        }
      }
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          isTransitLeg={false}
          renderModeIcons={renderModeIcons}
          leg={leg}
          duration={bikingTime}
          mode="CITYBIKE"
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
    } else if (leg.mode === 'CAR') {
      const drivingTime = Math.floor((leg.endTime - leg.startTime) / 1000 / 60);
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          leg={leg}
          duration={drivingTime}
          mode="CAR"
          legLength={legLength}
          large={breakpoint === 'large'}
          icon="icon-icon_car-withoutBox"
        />,
      );
      if (leg.to.carPark) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg car_park"
            key={`${leg.mode}_${leg.startTime}_car_park_indicator`}
          >
            <Icon
              img="icon-icon_car_park-withoutBox"
              className="itinerary-icon car_park"
            />
          </div>,
        );
      }
    } else if (leg.mode === 'BICYCLE' && renderBar) {
      const bikingTime = Math.floor((leg.endTime - leg.startTime) / 1000 / 60);
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          isTransitLeg={false}
          duration={bikingTime}
          renderModeIcons={renderModeIcons}
          leg={leg}
          mode={leg.mode}
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
      if (leg.to.bikePark) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg bike_park"
            key={`${leg.mode}_${leg.startTime}_bike_park_indicator`}
          >
            <Icon
              img="icon-bike_parking"
              className="itinerary-icon bike_park"
            />
          </div>,
        );
      }
    }

    if (leg.route) {
      const withBicycle =
        usingOwnBicycleWholeTrip &&
        (leg.route.mode === 'RAIL' || leg.route.mode === 'SUBWAY');
      if (
        previousLeg &&
        !previousLeg.intermediatePlace &&
        connectsFromViaPoint(leg, intermediatePlaces)
      ) {
        legs.push(<ViaLeg key={`via_${leg.mode}_${leg.startTime}`} />);
      }
      const renderRouteNumberForALongLeg =
        legLength > renderRouteNumberThreshold &&
        !longName &&
        transitLegCount < 7;
      if (!leg.interlineWithPreviousLeg) {
        legs.push(
          <RouteLeg
            key={`${leg.mode}_${leg.startTime}`}
            leg={leg}
            fitRouteNumber={
              (fitAllRouteNumbers && !longName) || renderRouteNumberForALongLeg
            }
            interliningWithRoute={interliningWithRoute}
            intl={intl}
            legLength={legLength}
            large={breakpoint === 'large'}
            withBicycle={withBicycle}
          />,
        );
      }
      vehicleNames.push(
        formatMessage(
          {
            id: `${leg.mode.toLowerCase()}-with-route-number`,
          },
          {
            routeNumber: leg.route.shortName,
            headSign: '',
          },
        ),
      );
      stopNames.push(leg.from.name);
    }

    if (waiting && !nextLeg?.interlineWithPreviousLeg) {
      const waitingTimeinMin = Math.floor(waitTime / 1000 / 60);
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}_wait`}
          leg={leg}
          legLength={waitLength}
          renderModeIcons={renderModeIcons}
          duration={waitingTimeinMin}
          isTransitLeg={false}
          mode="WAIT"
          large={breakpoint === 'large'}
        />,
      );
    }
  });
  const normalLegs = legs.length - onlyIconLegs;
  // how many pixels to take from each 'normal' leg to give room for the icons
  const iconLegsInPixels = (24 * onlyIconLegs) / normalLegs;
  // the leftover percentage from only showing icons added to each 'normal' leg
  const iconLegsInPercents = onlyIconLegsLength / normalLegs;
  let firstDeparture;
  if (!noTransitLegs) {
    firstDeparture = compressedLegs.find(isTransitLeg);
    if (firstDeparture) {
      let firstDepartureStopType;
      if (firstDeparture.mode === 'RAIL' || firstDeparture.mode === 'SUBWAY') {
        firstDepartureStopType = 'from-station';
      } else {
        firstDepartureStopType = 'from-stop';
      }
      let firstDeparturePlatform;
      if (firstDeparture.from.stop?.platformCode) {
        const comma = ', ';
        firstDeparturePlatform = (
          <span className="platform-or-track">
            {comma}
            <FormattedMessage
              id={firstDeparture.mode === 'RAIL' ? 'track-num' : 'platform-num'}
              values={{ platformCode: firstDeparture.from.stop?.platformCode }}
            />
          </span>
        );
      }
      firstLegStartTime = firstDeparture.rentedBike ? (
        <div
          className={cx('itinerary-first-leg-start-time', {
            small: breakpoint !== 'large',
          })}
        >
          <FormattedMessage
            id="itinerary-summary-row.first-leg-start-time-citybike"
            values={{
              firstDepartureTime: (
                <span
                  className={cx('time', { realtime: firstDeparture.realTime })}
                >
                  <LocalTime time={firstDeparture.startTime} />
                </span>
              ),
              firstDepartureStop: firstDeparture.from.name,
            }}
          />
          <div>
            {context.config.cityBike.capacity !== BIKEAVL_UNKNOWN && (
              <FormattedMessage
                id="bikes-available"
                values={{
                  amount: firstDeparture.from.bikeRentalStation.bikesAvailable,
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div
          className={cx('itinerary-first-leg-start-time', 'overflow-fade', {
            small: breakpoint !== 'large',
          })}
        >
          <FormattedMessage
            id="itinerary-summary-row.first-leg-start-time"
            values={{
              firstDepartureTime: (
                <span
                  className={cx('start-time', {
                    realtime: firstDeparture.realTime,
                    late: isLate(firstDeparture),
                  })}
                >
                  <LocalTime time={firstDeparture.startTime} />
                </span>
              ),
              firstDepartureStopType: (
                <FormattedMessage id={firstDepartureStopType} />
              ),
              firstDepartureStop: stopNames[0],
              firstDeparturePlatform,
            }}
          />
        </div>
      );
    }
  } else {
    firstLegStartTime = (
      <div
        className={cx('itinerary-first-leg-start-time', {
          small: breakpoint !== 'large',
        })}
      >
        <FormattedMessage id="itinerary-summary-row.no-transit-legs" />
      </div>
    );
  }

  const classes = cx([
    'itinerary-summary-row',
    'cursor-pointer',
    {
      passive: props.passive,
      'bp-large': breakpoint === 'large',
      'cancelled-itinerary': props.isCancelled,
    },
  ]);

  const itineraryStartAndEndTime = (
    <div>
      <LocalTime time={startTime} />
      <span> - </span>
      <LocalTime time={endTime} />
    </div>
  );

  //  accessible representation for summary
  const textSummary = (
    <div className="sr-only" key="screenReader">
      <FormattedMessage
        id="itinerary-summary-row.description"
        values={{
          departureDate: dateOrEmpty(startTime, refTime),
          departureTime: <LocalTime time={startTime} />,
          arrivalDate: dateOrEmpty(endTime, refTime),
          arrivalTime: <LocalTime time={endTime} />,
          firstDeparture:
            vehicleNames.length === 0 ? null : (
              <>
                <FormattedMessage
                  id="itinerary-summary-row.first-departure"
                  values={{
                    vehicle: vehicleNames[0],
                    departureTime: firstDeparture ? (
                      <LocalTime time={firstDeparture.startTime} />
                    ) : (
                      'ggh'
                    ),
                    stopName: stopNames[0],
                  }}
                />
              </>
            ),
          transfers: vehicleNames.map((name, index) => {
            if (index === 0) {
              return null;
            }
            return formatMessage(
              { id: 'itinerary-summary-row.transfers' },
              {
                vehicle: name,
                stopName: stopNames[index],
              },
            );
          }),
          totalTime: <RelativeDuration duration={duration} />,
        }}
      />
    </div>
  );

  const ariaLabelMessage = intl.formatMessage(
    {
      id: 'itinerary-page.show-details-label',
    },
    { number: props.hash + 1 },
  );

  const dateString = dateOrEmpty(startTime, refTime);
  const date = (
    <>
      {dateString}
      <span> </span>
      {dateString && <FormattedMessage id="at-time" />}
    </>
  );

  const startDate = isTomorrow(startTime, refTime) ? (
    <div className="tomorrow">
      <FormattedMessage id="tomorrow" />
    </div>
  ) : (
    date
  );
  return (
    <span role="listitem" className={classes} aria-atomic="true">
      <h3 className="sr-only">
        <FormattedMessage
          id="summary-page.row-label"
          values={{
            number: props.hash + 1,
          }}
        />
      </h3>
      {textSummary}
      <div
        className="itinerary-summary-visible"
        style={{
          display: props.isCancelled && !props.showCancelled ? 'none' : 'flex',
        }}
      >
        {/* This next clickable region does not have proper accessible role, tabindex and keyboard handler
            because screen reader works weirdly with nested buttons. Same functonality works from the inner button */
        /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <>
          <div className="itinerary-summary-header">
            <div
              className="summary-clickable-area"
              onClick={e => {
                if (mobile(breakpoint)) {
                  e.stopPropagation();
                  props.onSelectImmediately(props.hash);
                } else {
                  props.onSelect(props.hash);
                }
              }}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && props.onSelect(props.hash)
              }
              tabIndex="0"
              role="button"
              aria-label={ariaLabelMessage}
            >
              <span key="ShowOnMapScreenReader" className="sr-only">
                <FormattedMessage id="itinerary-summary-row.clickable-area-description" />
              </span>
              <div
                className="itinerary-duration-container"
                key="startTime"
                aria-hidden="true"
              >
                {startDate && (
                  <div className="itinerary-start-date">{startDate}</div>
                )}
                <div className="itinerary-start-time-and-end-time">
                  {itineraryStartAndEndTime}
                </div>
                <div className="itinerary-duration">
                  <RelativeDuration duration={duration} />
                </div>
              </div>
              <div
                className="legs-container"
                style={{ '--minus': `${iconLegsInPixels}px` }}
                key="legs"
                aria-hidden="true"
              >
                <div
                  className="itinerary-legs"
                  style={{ '--plus': `${iconLegsInPercents}%` }}
                >
                  {legs}
                </div>
              </div>
              <div
                className="itinerary-first-leg-start-time-container"
                key="endtime-distance"
                aria-hidden="true"
              >
                {firstLegStartTime}
              </div>
              {showRentalBikeDurationWarning &&
                (citybikeNetworks.size === 1 ? (
                  <div className="citybike-duration-info-short">
                    <Icon img={citybikeicon} height={1.2} width={1.2} />
                    <FormattedMessage
                      id="citybike-duration-info-short"
                      values={{
                        duration:
                          config.cityBike?.networks[bikeNetwork]
                            .timeBeforeSurcharge / 60,
                      }}
                      defaultMessage=""
                    />
                  </div>
                ) : (
                  <div className="citybike-duration-info-short">
                    <Icon img={citybikeicon} height={1.2} width={1.2} />
                    <FormattedMessage
                      id="citybike-duration-general-header"
                      defaultMessage=""
                    />
                  </div>
                ))}
            </div>
            {mobile(breakpoint) !== true && (
              <div
                tabIndex="0"
                role="button"
                title={formatMessage({
                  id: 'itinerary-page.show-details',
                })}
                key="arrow"
                className="action-arrow-click-area flex-vertical noborder"
                onClick={e => {
                  e.stopPropagation();
                  props.onSelectImmediately(props.hash);
                }}
                onKeyPress={e =>
                  isKeyboardSelectionEvent(e) &&
                  props.onSelectImmediately(props.hash)
                }
                aria-label={ariaLabelMessage}
              >
                <div className="action-arrow flex-grow">
                  <Icon img="icon-icon_arrow-collapse--right" />
                </div>
              </div>
            )}
          </div>
          <span className="itinerary-details-container" aria-expanded="false" />
        </>
      </div>
    </span>
  );
};

SummaryRow.propTypes = {
  refTime: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  passive: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  hash: PropTypes.number.isRequired,
  children: PropTypes.node,
  breakpoint: PropTypes.string.isRequired,
  intermediatePlaces: PropTypes.array,
  isCancelled: PropTypes.bool,
  showCancelled: PropTypes.bool,
  zones: PropTypes.arrayOf(PropTypes.string),
  delayThreshold: PropTypes.number,
};

SummaryRow.defaultProps = {
  zones: [],
};

SummaryRow.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

SummaryRow.displayName = 'SummaryRow';

const SummaryRowWithBreakpoint = withBreakpoint(SummaryRow);

export { SummaryRow as component, SummaryRowWithBreakpoint as default };
