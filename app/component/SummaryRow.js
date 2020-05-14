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
import { displayDistance } from '../util/geo-utils';
import {
  containsBiking,
  compressLegs,
  getLegBadgeProps,
  getTotalBikingDistance,
  getTotalWalkingDistance,
  isCallAgencyPickupType,
  onlyBiking,
} from '../util/legUtils';
import { sameDay, dateOrEmpty } from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import { isKeyboardSelectionEvent } from '../util/browser';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

import ComponentUsageExample from './ComponentUsageExample';
import {
  exampleData,
  exampleDataBiking,
  exampleDataCallAgency,
  examplePropsCityBike,
  exampleDataVia,
  exampleDataCanceled,
} from './data/SummaryRow.ExampleData';

const Leg = ({ routeNumber, legLength }) => (
  <div className="leg" style={{ '--width': `${legLength}%` }}>
    {routeNumber}
  </div>
);

Leg.propTypes = {
  routeNumber: PropTypes.node.isRequired,
  legLength: PropTypes.number.isRequired,
};

export const RouteLeg = ({
  leg,
  large,
  intl,
  legLength,
  renderNumber,
  isTransitLeg,
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
        vertical
        withBar
        isTransitLeg={isTransitLeg}
        renderNumber={renderNumber}
      />
    );
  }
  return (
    <Leg
      leg={leg}
      routeNumber={routeNumber}
      large={large}
      legLength={legLength}
    />
  );
};

RouteLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  large: PropTypes.bool.isRequired,
  legLength: PropTypes.number.isRequired,
  renderNumber: PropTypes.bool,
  isTransitLeg: PropTypes.bool,
};

RouteLeg.defaultProps = {
  isTransitLeg: true,
};

export const ModeLeg = (
  { leg, mode, large, legLength, walkingTime, renderNumber, isTransitLeg },
  { config },
) => {
  let networkIcon;
  if (mode === 'BICYCLE' && leg.from.bikeRentalStation) {
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
      walkingTime={walkingTime}
      isTransitLeg={isTransitLeg}
      renderNumber={renderNumber}
      vertical
      withBar
      icon={networkIcon}
      {...getLegBadgeProps(leg, config)}
    />
  );
  return (
    <Leg
      leg={leg}
      routeNumber={routeNumber}
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
  walkingTime: PropTypes.number,
  renderNumber: PropTypes.bool,
  isTransitLeg: PropTypes.bool,
};

ModeLeg.contextTypes = {
  config: PropTypes.object.isRequired,
};

const CityBikeLeg = ({ leg, large }) => (
  <ModeLeg leg={leg} mode="CITYBIKE" large={large} />
);

CityBikeLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  large: PropTypes.bool.isRequired,
};

export const ViaLeg = () => (
  <div className="leg via">
    <Icon img="icon-icon_mapMarker-via" className="itinerary-icon place" />
  </div>
);

/**
 * Calculates the total slack time spent (in ms) in all of the intermediate places that
 * the itinerary may contain.
 *
 * @param {*} intermediatePlaces Any intermediate places that the itinerary contains
 */
const getTotalSlackDuration = intermediatePlaces => {
  if (!Array.isArray(intermediatePlaces)) {
    return 0;
  }
  const getLocationSlackTimeInMsOrDefault = (location, defaultValue = 0) =>
    (location && location.locationSlack) * 1000 || defaultValue;
  return intermediatePlaces.reduce(
    (a, b) =>
      getLocationSlackTimeInMsOrDefault(a) +
      getLocationSlackTimeInMsOrDefault(b),
    0,
  );
};

/**
 * The relative duration of a leg that, if not met, may result in the leg being
 * discarded from the top level summary view.
 */
const LEG_DURATION_THRESHOLD = 0.025;

/**
 * Checks that the given leg's duration is big enough to be considered for
 * showing in the top level summary view.
 *
 * @param {number} totalDuration The total duration of the itinerary (in ms)
 * @param {number} totalSlackDuration The total slack duration of the itinerary (in ms)
 * @param {*} leg The leg to check the threshold for
 */
const checkRelativeDurationThreshold = (
  totalDuration,
  totalSlackDuration,
  leg,
) =>
  totalDuration <= totalSlackDuration ||
  moment(leg.endTime).diff(moment(leg.startTime)) /
    (totalDuration - totalSlackDuration) >
    LEG_DURATION_THRESHOLD;

const getViaPointIndex = (leg, intermediatePlaces) => {
  if (!leg || !Array.isArray(intermediatePlaces)) {
    return -1;
  }
  return intermediatePlaces.findIndex(
    place => place.lat === leg.from.lat && place.lon === leg.from.lon,
  );
};

/**
 * Checks if the leg connects two consecutive via points.
 *
 * @param {*} leg The leg to check the connection for
 * @param {*} nextLeg The next leg in the itinerary
 * @param {[*]} intermediatePlaces The intermediate places in the itinerary
 */
const isViaPointConnectingLeg = (leg, nextLeg, intermediatePlaces) => {
  if (!nextLeg || !Array.isArray(intermediatePlaces)) {
    return false;
  }
  const startIndex = getViaPointIndex(leg, intermediatePlaces);
  if (startIndex === -1) {
    return false;
  }
  const endIndex = getViaPointIndex(nextLeg, intermediatePlaces);
  if (endIndex === -1) {
    return false;
  }
  return endIndex - startIndex === 1; // via points have to be right after the other
};

const SummaryRow = (
  { data, breakpoint, intermediatePlaces, zones, ...props },
  { intl, intl: { formatMessage }, config },
) => {
  const isTransitLeg = leg => leg.transitLeg; // || leg.rentedBike;
  const refTime = moment(props.refTime);
  const startTime = moment(data.startTime);
  const endTime = moment(data.endTime);
  const duration = endTime.diff(startTime);
  const slackDuration = getTotalSlackDuration(intermediatePlaces);
  const legs = [];
  let noTransitLegs = true;
  const compressedLegs = compressLegs(data.legs).map(leg => ({
    ...leg,
  }));

  compressedLegs.forEach(leg => {
    if (isTransitLeg(leg)) {
      noTransitLegs = false;
    }
  });

  let firstLegStartTime = null;
  const vehicleNames = [];
  const stopNames = [];
  const renderBarThreshold = 5;
  const renderNumberThreshold = 9;
  let addition = 0;

  compressedLegs.forEach((leg, i) => {
    let renderNumber = true;
    let renderBar = true;
    let waiting = false;
    let waitTime;
    let legLength;
    let waitLength;
    const isLastLeg = i === compressedLegs.length - 1;
    const isNextLegLast = i + 1 === compressedLegs.length - 1;
    const previousLeg = compressedLegs[i - 1];
    const lastLeg = compressedLegs[compressedLegs.length - 1];
    const nextLeg = compressedLegs[i + 1];
    const isThresholdMet = checkRelativeDurationThreshold(
      duration,
      slackDuration,
      leg,
    );
    const waitThreshold = 180000;
    legLength = leg.duration * 1000 / duration * 100;

    if (nextLeg) {
      waitTime = nextLeg.startTime - leg.endTime;
      waitLength = Math.round(waitTime / duration * 100);
      if (waitTime > waitThreshold || waitLength > renderBarThreshold) {
        waiting = true;
      } else {
        legLength = (leg.duration * 1000 + waitTime) / duration * 100;
      }
    }
    if (addition > 0) {
      legLength += addition;
    }
    if (isNextLegLast) {
      const lastLegLength = lastLeg.duration * 1000 / duration * 100;
      if (lastLegLength < renderBarThreshold) {
        legLength += lastLegLength;
      }
    }
    if (legLength < renderBarThreshold && !leg.transitLeg) {
      renderBar = false;
      addition = legLength;
    } else if (legLength < renderBarThreshold && leg.transitLeg) {
      addition += legLength - renderBarThreshold;
      legLength = renderBarThreshold;
    }

    if (legLength < renderNumberThreshold) {
      renderNumber = false;
    }

    if (leg.mode === 'WALK' && renderBar) {
      const walkingTime = Math.floor(leg.duration / 60);
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          renderNumber={renderNumber}
          isTransitLeg={false}
          leg={leg}
          walkingTime={walkingTime}
          mode="WALK"
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
    } else if (leg.rentedBike) {
      const bikingTime = Math.floor(leg.duration / 60);
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          isTransitLeg={false}
          renderNumber={renderNumber}
          leg={leg}
          walkingTime={bikingTime}
          mode="CITYBIKE"
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
    } else if (leg.mode === 'CAR') {
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          leg={leg}
          mode="CAR"
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
    } else if (leg.mode === 'BICYCLE' || leg.mode === 'BICYCLE_WALK') {
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}`}
          isTransitLeg={false}
          leg={leg}
          mode={leg.mode}
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
    }

    if (leg.intermediatePlace) {
      legs.push(<ViaLeg key={`via_${leg.mode}_${leg.startTime}`} />);
      if (
        (noTransitLegs && isThresholdMet) ||
        isViaPointConnectingLeg(leg, nextLeg, intermediatePlaces) ||
        isLastLeg
      ) {
        legs.push(
          <ModeLeg
            key={`${leg.mode}_${leg.startTime}`}
            leg={leg}
            mode={leg.mode}
            legLength={legLength}
            large={breakpoint === 'large'}
          />,
        );
      }
    }

    const connectsFromViaPoint = () =>
      getViaPointIndex(leg, intermediatePlaces) > -1;

    if (leg.route) {
      if (
        previousLeg &&
        !previousLeg.intermediatePlace &&
        connectsFromViaPoint()
      ) {
        legs.push(<ViaLeg key={`via_${leg.mode}_${leg.startTime}`} />);
      }
      legs.push(
        <RouteLeg
          key={`${leg.mode}_${leg.startTime}`}
          leg={leg}
          renderNumber={renderNumber}
          intl={intl}
          legLength={legLength}
          large={breakpoint === 'large'}
        />,
      );
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

    if (waiting) {
      if (addition > 0) {
        waitLength += addition;
        if (waitLength > renderBarThreshold) {
          addition = 0;
        } else {
          addition = waitLength;
        }
      }
      legs.push(
        <ModeLeg
          key={`${leg.mode}_${leg.startTime}_wait`}
          leg={leg}
          legLength={waitLength}
          mode="WAIT"
          large={breakpoint === 'large'}
        />,
      );
    }
  });

  if (!noTransitLegs) {
    let firstDeparture = false;
    let firstDepartureStartTime;
    if (
      data.legs[1] != null &&
      (data.legs[1].rentedBike || data.legs[1].transitLeg)
    ) {
      firstDepartureStartTime = data.legs[1].startTime;
      [, firstDeparture] = data.legs;
    }

    if (data.legs[0].transitLeg || data.legs[0].rentedBike) {
      [firstDeparture] = data.legs;
      firstDepartureStartTime = data.legs[0].startTime;
    }
    if (firstDeparture) {
      let firstDepartureStopType;
      if (firstDeparture.mode === 'RAIL' || firstDeparture.mode === 'SUBWAY') {
        firstDepartureStopType = 'from-station';
      } else {
        firstDepartureStopType = 'from-stop';
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
                <span className="first-leg-start-time-green">
                  <LocalTime time={firstDepartureStartTime} />
                </span>
              ),
              firstDepartureStop: firstDeparture.from.name,
            }}
          />
          <div>
            <FormattedMessage
              id="bikes-available"
              values={{
                amount: firstDeparture.from.bikeRentalStation.bikesAvailable,
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className={cx('itinerary-first-leg-start-time', {
            small: breakpoint !== 'large',
          })}
        >
          <FormattedMessage
            id="itinerary-summary-row.first-leg-start-time"
            values={{
              firstDepartureTime: (
                <span className="first-leg-start-time-green">
                  <LocalTime time={firstDepartureStartTime} />
                </span>
              ),
              firstDepartureStopType: (
                <FormattedMessage id={firstDepartureStopType} />
              ),
              firstDepartureStop: stopNames[0],
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
      open: props.open || props.children,
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

  const isDefaultPosition = breakpoint !== 'large' && !onlyBiking(data);
  const renderBikingDistance = itinerary =>
    containsBiking(itinerary) && (
      <div className="itinerary-biking-distance">
        <Icon img="icon-icon_biking" viewBox="0 0 40 40" />
        {displayDistance(getTotalBikingDistance(itinerary), config)}
      </div>
    );

  const showDetails = props.open || props.children;

  //  accessible representation for summary
  const textSummary = showDetails ? null : (
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
                    departureTime: firstLegStartTime,
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
          distance: (
            <FormattedMessage
              id={
                containsBiking(data)
                  ? 'itinerary-summary-row.biking-distance'
                  : 'itinerary-summary-row.walking-distance'
              }
              values={{
                totalDistance: displayDistance(
                  containsBiking(data)
                    ? getTotalBikingDistance(data)
                    : getTotalWalkingDistance(data),
                  config,
                ),
              }}
            />
          ),
        }}
      />
    </div>
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
        {showDetails ? (
          <>
            <div className="itinerary-summary-header">
              <div
                className="summary-clickable-area"
                onClick={() => props.onSelect(props.hash)}
                aria-hidden="true"
              >
                {/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <div className="flex-grow itinerary-heading" key="title">
                  <h4 className="h2">
                    <FormattedMessage
                      id="itinerary-page.title"
                      defaultMessage="Itinerary"
                    />
                  </h4>
                </div>
              </div>
              <div
                tabIndex="0"
                role="button"
                title={formatMessage({
                  id: 'itinerary-page.hide-details',
                })}
                key="arrow"
                className="action-arrow-click-area noborder flex-vertical"
                onClick={e => {
                  e.stopPropagation();
                  props.onSelectImmediately(props.hash);
                }}
                onKeyPress={e =>
                  isKeyboardSelectionEvent(e) &&
                  props.onSelectImmediately(props.hash)
                }
              >
                <div className="action-arrow flex-grow">
                  <Icon img="icon-icon_arrow-collapse--right" />
                </div>
              </div>
            </div>
            {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <span
              className="itinerary-details-container visible"
              aria-expanded="true"
              onClick={() => props.onSelect(props.hash)}
            >
              {/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
              <h4 className="sr-only">
                <FormattedMessage
                  id="itinerary-page.title"
                  defaultMessage="Itinerary"
                />
              </h4>
              {props.children &&
                React.cloneElement(React.Children.only(props.children), {
                  searchTime: props.refTime,
                })}
            </span>
          </>
        ) : (
          <>
            <div className="itinerary-summary-header">
              <div
                className="summary-clickable-area"
                onClick={() => props.onSelect(props.hash)}
                onKeyPress={e =>
                  isKeyboardSelectionEvent(e) && props.onSelect(props.hash)
                }
                tabIndex="0"
                role="button"
              >
                <span key="ShowOnMapScreenReader" className="sr-only">
                  <FormattedMessage id="itinerary-summary-row.clickable-area-description" />
                </span>
                <div
                  className="itinerary-duration-container"
                  key="startTime"
                  aria-hidden="true"
                >
                  <span
                    className={cx('itinerary-start-date', {
                      nobg: sameDay(startTime, refTime),
                    })}
                  >
                    <span>{dateOrEmpty(startTime, refTime)}</span>
                  </span>
                  <div className="itinerary-start-time-and-end-time">
                    {itineraryStartAndEndTime}
                  </div>
                  <div className="itinerary-duration">
                    <RelativeDuration duration={duration} />
                  </div>
                </div>
                <div className="itinerary-legs" key="legs" aria-hidden="true">
                  {legs}
                </div>
                <div
                  className="itinerary-first-leg-start-time-container"
                  key="endtime-distance"
                  aria-hidden="true"
                >
                  {firstLegStartTime}
                  {isDefaultPosition && renderBikingDistance(data)}
                </div>
                {/* <div
                  className="itinerary-duration-and-distance"
                  key="duration-distance"
                  aria-hidden="true"
                >
                  {!isDefaultPosition && renderBikingDistance(data)}
                  /* {!onlyBiking(data) && (
                    <div className="itinerary-walking-distance">
                      <Icon img="icon-icon_walk" viewBox="6 0 40 40" />
                      {displayDistance(getTotalWalkingDistance(data), config)}
                    </div>
                  )} 
                </div> */}
              </div>
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
              >
                <div className="action-arrow flex-grow">
                  <Icon img="icon-icon_arrow-collapse--right" />
                </div>
              </div>
            </div>
            <span
              className="itinerary-details-container"
              aria-expanded="false"
            />
          </>
        )}
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
  open: PropTypes.bool,
  breakpoint: PropTypes.string.isRequired,
  intermediatePlaces: PropTypes.array,
  isCancelled: PropTypes.bool,
  showCancelled: PropTypes.bool,
  zones: PropTypes.arrayOf(PropTypes.string),
};

SummaryRow.defaultProps = {
  zones: [],
};

SummaryRow.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

SummaryRow.displayName = 'SummaryRow';

const nop = () => {};

SummaryRow.description = () => {
  const today = 1478522040000;
  const date = 1478611781000;
  return (
    <div>
      <p>Displays a summary of an itinerary.</p>
      <ComponentUsageExample description="large">
        {/* passive-large-today */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* active-large-today */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* "passive-large-tomorrow" */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* "active-large-tomorrow" */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* "open-large-today" */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          open
        />
        {/* "open-large-tomorrow" */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          open
        />
        {/* active-large-via */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataVia(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* active-large-call-agency */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataCallAgency(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* passive-large-biking */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataBiking(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* citybike-large-passive */}
        <SummaryRow {...examplePropsCityBike('large')} />
        {/* canceled-large-itinerary */}
        <SummaryRow
          refTime={today}
          breakpoint="large"
          data={exampleDataCanceled}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          isCancelled
          showCancelled
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="small">
        {/* passive-small-today */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* active-small-today */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(today)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* passive-small-tomorrow */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(date)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* active-small-tomorrow */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleData(date)}
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* passive-small-via */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataVia(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* passive-small-call-agency */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataCallAgency(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* passive-small-biking */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataBiking(today)}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
        />
        {/* citybike-small-passive */}
        <SummaryRow {...examplePropsCityBike('small')} />
        {/* canceled-large-itinerary */}
        <SummaryRow
          refTime={today}
          breakpoint="small"
          data={exampleDataCanceled}
          passive
          onSelect={nop}
          onSelectImmediately={nop}
          hash={1}
          isCancelled
          showCancelled
        />
      </ComponentUsageExample>
    </div>
  );
};

const SummaryRowWithBreakpoint = withBreakpoint(SummaryRow);

export { SummaryRow as component, SummaryRowWithBreakpoint as default };
