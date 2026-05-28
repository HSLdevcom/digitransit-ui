import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { createRef, useLayoutEffect, useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'found';
import { locationShape, itineraryShape } from '../../util/shapes';
import Icon from '../Icon';
import Feedback from './Feedback';
import StreetBar from './StreetBar';
import TransitBar from './TransitBar';
import {
  getLegMode,
  compressLegs,
  getInterliningLegs,
  isFirstInterliningLeg,
  getTotalDistance,
  getTripOrRouteText,
  legTime,
  legTimeStr,
  LegMode,
  getZones,
  isCallAgencyLeg,
  splitLegsAtViaPoints,
  hasTaxiLegs,
} from '../../util/legUtils';
import {
  dateOrEmpty,
  durationToString,
  isTomorrow,
  timeStr,
} from '../../util/timeUtils';
import withBreakpoint from '../../util/withBreakpoint';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { getItineraryPagePath, streetHash } from '../../util/path';
import {
  BIKEAVL_UNKNOWN,
  getRentalNetworkIcon,
  getRentalNetworkConfig,
  getVehicleCapacity,
} from '../../util/vehicleRentalUtils';
import {
  getFirstDepartureStopTypeText,
  getSummaryDescriptionText,
} from '../../util/modeUtils';
import getCo2Value from '../../util/emissions';
import { ItineraryFragment } from './queries/ItineraryFragment';
import { getTicketString } from '../../util/fareUtils';
import { ViaLocationType } from '../../constants';
import BoardingInformation, {
  getBoardingInformationText,
} from './BoardingInformation';
import { useConfigContext } from '../../configurations/ConfigContext';

const NAME_LENGTH_THRESHOLD = 65; // for truncating long short names

export const ViaLeg = () => (
  <div className="leg via">
    <Icon img="icon_mapMarker" className="itinerary-icon place" />
  </div>
);

const bikeWasParked = legs => {
  const legsLength = legs.length;
  for (let i = 0; i < legsLength; i++) {
    if (legs[i].to && legs[i].to.vehicleParking) {
      return i;
    }
  }
  return legs.length;
};

const hasOneTransitLeg = itinerary => {
  return itinerary.legs.filter(leg => leg.transitLeg).length === 1;
};

const Itinerary = ({
  itinerary: itineraryRef,
  breakpoint,
  intermediatePlaces = [],
  hideSelectionIndicator = true,
  lowestCo2value = 0,
  passive = false,
  focusToHeader,
  ...props
}) => {
  const intl = useIntl();
  const config = useConfigContext();
  const { formatMessage } = intl;
  const itinerary = useFragment(ItineraryFragment, itineraryRef);
  const { router, match } = useRouter();

  const onSelectImmediately = () => {
    const modesWithSubpath = [
      streetHash.bikeAndVehicle,
      streetHash.parkAndRide,
      streetHash.carAndVehicle,
    ];
    const subpath = modesWithSubpath.includes(match.params.hash)
      ? `/${match.params.hash}/`
      : '/';

    // eslint-disable-next-line compat/compat
    const momentumScroll =
      document.getElementsByClassName('momentum-scroll')[0];
    if (momentumScroll) {
      momentumScroll.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    if (hasTaxiLegs(itinerary)) {
      addAnalyticsEvent({
        event: 'sendMatomoEvent',
        category: 'Itinerary',
        action: 'OpenItineraryDetailsWithMode',
        name: 'taxi',
      });
    }

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: props.hash,
    });

    const basePath = `${getItineraryPagePath(
      match.params.from,
      match.params.to,
    )}${subpath}`;
    const indexPath = `${basePath}${props.hash}`;
    const newLocation = {
      ...match.location,
      state: { ...match.location.state, selectedItineraryIndex: props.hash },
    };
    newLocation.pathname = basePath;
    router.replace(newLocation);
    newLocation.pathname = indexPath;
    router.push(newLocation);
    focusToHeader();
  };

  const onSelectActive = () => {
    if (!passive) {
      onSelectImmediately();
    } else {
      router.replace({
        ...match.location,
        state: {
          ...match.location.state,
          selectedItineraryIndex: props.hash,
        },
      });
      addAnalyticsEvent({
        category: 'Itinerary',
        action: 'HighlightItinerary',
        name: props.hash,
      });
    }
  };

  const isTransitLeg = leg => leg.transitLeg;
  const isTransitOrRentalLeg = leg => leg.transitLeg || leg.rentedBike;
  const isLegOnFoot = leg => leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK';
  const usingOwnBicycle = itinerary.legs.some(
    leg => getLegMode(leg) === 'BICYCLE' && leg.rentedBike === false,
  );
  const usingOwnBicycleWholeTrip =
    usingOwnBicycle && itinerary.legs.every(leg => !leg.to.vehicleParking);
  const usingOwnCar = itinerary.legs.some(leg => getLegMode(leg) === 'CAR');
  const usingOwnCarWholeTrip =
    usingOwnCar && itinerary.legs.every(leg => !leg.to.vehicleParking);
  const { refTime } = props;
  const startTime = Date.parse(itinerary.start);
  const endTime = Date.parse(itinerary.end);
  const departureTime = timeStr(itinerary.start);
  const arrivalTime = timeStr(itinerary.end);
  const duration = endTime - startTime;
  const co2value = getCo2Value(itinerary);
  const mobile = bp => !(bp === 'large');
  const legs = [];
  let noTransitLegs = true;
  const splitLegs = splitLegsAtViaPoints(itinerary.legs, intermediatePlaces);
  const compressedLegs = compressLegs(splitLegs).map(leg => ({
    ...leg,
  }));
  let intermediateSlack = 0;
  let transitLegCount = 0;
  let containsScooterLeg = false;
  let nameLengthSum = 0; // approximate space required for route labels
  compressedLegs.forEach((leg, i) => {
    if (isTransitLeg(leg)) {
      noTransitLegs = false;
      transitLegCount += 1;
      nameLengthSum += getTripOrRouteText(leg.trip, leg.route, config).length;
    }
    nameLengthSum += 10; // every leg requires some minimum space
    if (i > 0 && (leg.from.viaLocationType || leg.to.viaLocationType)) {
      intermediateSlack +=
        legTime(leg.start) - legTime(compressedLegs[i - 1].end); // calculate time spent at each intermediate place
    }
    containsScooterLeg = leg.mode === 'SCOOTER' || containsScooterLeg;
  });
  const shortenLabels = nameLengthSum > NAME_LENGTH_THRESHOLD;
  const durationWithoutSlack = duration - intermediateSlack; // don't include time spent at intermediate places in calculations for bar lengths
  const relativeLength = durationMs =>
    (100 * durationMs) / durationWithoutSlack; // as %
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
  const lastLegLength = relativeLength(lastLeg.duration * 1000);
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
    const startMs = legTime(leg.start);
    const endMs = legTime(leg.end);
    const nextLeg =
      i < compressedLegs.length - 1 ? compressedLegs[i + 1] : null;
    let legLength = relativeLength(endMs - startMs);
    const routeName =
      leg.route && getTripOrRouteText(leg.trip, leg.route, config);
    const longName = !routeName || routeName.length > 5;

    if (nextLeg && !leg.to.viaLocationType) {
      // don't show waiting in intermediate places
      waitTime = legTime(nextLeg.start) - endMs;
      waitLength = relativeLength(waitTime);
      if (waitTime > waitThreshold && waitLength > renderBarThreshold) {
        // if waittime is long enough, render a waiting bar
        waiting = true;
      } else {
        // otherwise add the waiting to the current leg's length
        legLength = relativeLength(endMs - startMs + waitTime);
      }
    }

    if (isFirstInterliningLeg(compressedLegs, i)) {
      const [interliningLines, interliningLegs] = getInterliningLegs(
        compressedLegs,
        i,
      );
      interliningWithRoute = interliningLines.join(' / ');
      const lastLegWithInterline = interliningLegs[interliningLegs.length - 1];
      legLength = relativeLength(legTime(lastLegWithInterline.end) - startMs);
      if (
        compressedLegs.length - 2 === i + interliningLegs.length &&
        lastLegLength < renderBarThreshold
      ) {
        // If the last interlining leg is the next to last leg and
        // if the last leg is too short add its length to the interlining leg.
        legLength += lastLegLength;
      }
    } else if (leg.interlineWithPreviousLeg) {
      // Interlining legs after the first one should be skipped, this skips to the next index.
      return;
    } else if (
      compressedLegs.length - 2 === i &&
      lastLegLength < renderBarThreshold
    ) {
      // Interlining legs handle this addition differently.
      // If this leg is the next to last leg and
      // if the last leg is too short add its length to the leg before it.
      legLength += lastLegLength;
    }

    legLength += addition;
    addition = 0;
    if (legLength < renderBarThreshold && isLegOnFoot(leg)) {
      // don't render short legs that are on foot at all
      renderBar = false;
      addition += legLength; // carry over the length of the leg to the next
    }
    let viaPointAdded = false;
    if (leg.from.viaLocationType === ViaLocationType.Visit) {
      viaPointAdded = true;
      onlyIconLegs += 1;
      legs.push(<ViaLeg key={`via_${leg.mode}_${startMs}`} />);
    }
    if (isLegOnFoot(leg) && renderBar) {
      const walkingTime = Math.floor(leg.duration / 60);
      let walkMode = 'walk';
      if (usingOwnBicycle && i < bikeParkedIndex) {
        walkMode = 'bicycle_walk';
      }
      legs.push(
        <StreetBar
          key={`${leg.mode}_${startMs}`}
          renderModeIcons={renderModeIcons}
          leg={leg}
          duration={walkingTime}
          mode={walkMode}
          legLength={legLength}
        />,
      );
      if (usingOwnBicycle && leg.to.vehicleParking) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg bike_park"
            key={`${leg.mode}_${startMs}_bike_park_indicator`}
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
      const bikingTime = Math.floor(leg.duration / 60);
      bikeNetwork =
        leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
        leg.from.rentalVehicle?.rentalNetwork.networkId;
      if (
        bikeNetwork &&
        config.vehicleRental?.networks?.[bikeNetwork]?.timeBeforeSurcharge &&
        config.vehicleRental.networks[bikeNetwork].durationInstructions
      ) {
        const rentDurationOverSurchargeLimit =
          leg.duration >
          config.vehicleRental.networks[bikeNetwork].timeBeforeSurcharge;
        if (rentDurationOverSurchargeLimit) {
          citybikeNetworks.add(bikeNetwork);
        }
        showRentalBikeDurationWarning =
          showRentalBikeDurationWarning || rentDurationOverSurchargeLimit;
        if (!citybikeicon) {
          citybikeicon = getRentalNetworkIcon(
            getRentalNetworkConfig(bikeNetwork, config),
          );
        }
      }
      legs.push(
        <StreetBar
          key={`${leg.mode}_${startMs}`}
          renderModeIcons={renderModeIcons}
          leg={leg}
          duration={bikingTime}
          mode="CITYBIKE"
          legLength={legLength}
        />,
      );
      vehicleNames.push(
        formatMessage({
          id: `to-bicycle`,
        }),
      );
      stopNames.push(leg.from.name);
    } else if (leg.mode === 'SCOOTER' && leg.rentedBike) {
      const scooterDuration = Math.floor(leg.duration / 60);
      legs.push(
        <StreetBar
          key={`${leg.mode}_${leg.start.scheduledTime}`}
          renderModeIcons={renderModeIcons}
          leg={leg}
          duration={scooterDuration}
          mode="SCOOTER"
          legLength={legLength}
        />,
      );
      vehicleNames.push(
        formatMessage({
          id: `to-e-scooter`,
        }),
      );
      stopNames.push('');
    } else if (leg.mode === 'CAR') {
      const drivingTime = Math.floor(leg.duration / 60);
      legs.push(
        <StreetBar
          key={`${leg.mode}_${startMs}`}
          leg={leg}
          duration={drivingTime}
          mode="CAR"
          legLength={legLength}
          icon="icon_car"
        />,
      );
      if (leg.to.vehicleParking) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg car_park"
            key={`${leg.mode}_${startMs}_car_park_indicator`}
          >
            <Icon img="icon_car-park" className="itinerary-icon car_park" />
          </div>,
        );
      }
    } else if (leg.mode === 'BICYCLE' && renderBar) {
      const bikingTime = Math.floor(leg.duration / 60);
      legs.push(
        <StreetBar
          key={`${leg.mode}_${startMs}`}
          duration={bikingTime}
          renderModeIcons={renderModeIcons}
          leg={leg}
          mode={leg.mode}
          legLength={legLength}
        />,
      );
      if (leg.to.vehicleParking) {
        onlyIconLegs += 1;
        legs.push(
          <div
            className="leg bike_park"
            key={`${leg.mode}_${startMs}_bike_park_indicator`}
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
        config.bikeBoardingModes[leg.route.mode] !== undefined;
      const withCar =
        usingOwnCarWholeTrip &&
        config.carBoardingModes[leg.route.mode] !== undefined;
      if (
        leg.from.viaLocationType === ViaLocationType.PassThrough ||
        (leg.viaStopCall && !viaPointAdded)
      ) {
        viaPointAdded = true;
        onlyIconLegs += 1;
        legs.push(<ViaLeg key={`via_${leg.mode}_${startMs}`} />);
      }
      const renderRouteNumberForALongLeg =
        legLength > renderRouteNumberThreshold &&
        !longName &&
        transitLegCount < 7;
      legs.push(
        <TransitBar
          key={`${leg.mode}_${startMs}`}
          leg={leg}
          fitRouteNumber={
            (fitAllRouteNumbers && !longName) || renderRouteNumberForALongLeg
          }
          interliningWithRoute={interliningWithRoute}
          legLength={legLength}
          withBicycle={withBicycle}
          withCar={withCar}
          hasOneTransitLeg={hasOneTransitLeg(itinerary)}
          shortenLabels={shortenLabels}
        />,
      );
      vehicleNames.push(
        formatMessage(
          {
            id: `${leg.mode.toLowerCase()}-with-route-number`,
          },
          {
            routeNumber: routeName,
            headSign: '',
          },
        ),
      );
      stopNames.push(leg.from.name);
      if (
        leg.to.viaLocationType === ViaLocationType.PassThrough &&
        !(nextLeg.transitLeg && nextLeg.from.viaLocationType)
      ) {
        onlyIconLegs += 1;
        legs.push(<ViaLeg key={`via_${leg.mode}_${startMs}`} />);
      }
    }

    if (waiting && !nextLeg?.interlineWithPreviousLeg) {
      const waitingTimeinMin = Math.floor(waitTime / 1000 / 60);
      legs.push(
        <StreetBar
          key={`${leg.mode}_${startMs}_wait`}
          leg={leg}
          legLength={waitLength}
          renderModeIcons={renderModeIcons}
          duration={waitingTimeinMin}
          mode={LegMode.Wait}
          icon={usingOwnCarWholeTrip ? 'icon_wait-car' : 'icon_wait_standing'}
        />,
      );
    }
  });
  const normalLegs = legs.length - onlyIconLegs;
  // how many pixels to take from each 'normal' leg to give room for the icons
  const iconLegsInPixels = (24 * onlyIconLegs) / normalLegs;
  // the leftover percentage from only showing icons added to each 'normal' leg
  const iconLegsInPercents = onlyIconLegsLength / normalLegs;
  const hasCallAgencyLeg = itinerary.legs.some(leg => isCallAgencyLeg(leg));
  let firstDeparture;
  if (hasCallAgencyLeg) {
    firstLegStartTime = (
      <div
        className={cx('itinerary-first-leg-start-time', {
          small: breakpoint !== 'large',
        })}
      >
        <Icon
          img="icon_alert-circle"
          className="itinerary-summary-icon"
          omitViewBox
        />
        <FormattedMessage id="itinerary-summary-row.call-agency-description" />
      </div>
    );
  } else if (!noTransitLegs) {
    firstDeparture = compressedLegs.find(isTransitLeg);
    if (firstDeparture) {
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
                  {legTimeStr(firstDeparture.start)}
                </span>
              ),
              firstDepartureStop: firstDeparture.from.name,
            }}
          />
          <div>
            {getVehicleCapacity(
              config,
              firstDeparture.from.vehicleRentalStation.rentalNetwork.networkId,
            ) !== BIKEAVL_UNKNOWN && (
              <FormattedMessage
                id="bikes-available"
                values={{
                  amount:
                    firstDeparture.from.vehicleRentalStation.availableVehicles
                      .total,
                }}
              />
            )}
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
                <span
                  className={cx('start-time', {
                    realtime: firstDeparture.realTime,
                  })}
                >
                  {legTimeStr(firstDeparture.start)}
                </span>
              ),
              firstDepartureStopType: getFirstDepartureStopTypeText(
                intl,
                firstDeparture.mode,
              ),
              // In case the first leg is a scooter leg, stopNames[0] is an empty string
              firstDepartureStop: stopNames[0] || stopNames[1],
              firstDeparturePlatform: (
                <BoardingInformation leg={firstDeparture} />
              ),
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

  //  accessible representation for summary
  let firstDepartureLabelId = 'itinerary-summary-row.first-departure';
  const firstDepartureWithRentals = compressedLegs.find(isTransitOrRentalLeg);
  if (firstDepartureWithRentals?.rentedBike) {
    firstDeparture = firstDepartureWithRentals;
    firstDepartureLabelId =
      firstDeparture?.mode === LegMode.Scooter
        ? 'itinerary-summary-row.first-leg-start-time-scooter'
        : 'itinerary-summary-row.first-leg-start-time-citybike';
  } else if (firstDeparture?.mode === LegMode.Taxi) {
    firstDepartureLabelId = 'itinerary-summary-row.first-leg-start-time-taxi';
  }

  const summaryDescription = (
    <div className="sr-only" key="screenReader">
      {getSummaryDescriptionText(intl, {
        hasCallAgencyLeg,
        startTime,
        endTime,
        refTime,
        departureTime,
        arrivalTime,
        vehicleNames,
        firstDeparture,
        firstDepartureLabelId,
        stopNames,
        duration,
        firstDepartureTime: firstDeparture
          ? legTimeStr(firstDeparture.start)
          : '',
        platformOrTrack: getBoardingInformationText(firstDeparture, intl),
      })}
    </div>
  );
  const co2summary = (
    <FormattedMessage
      id="itinerary-co2.description-simple"
      defaultMessage="CO₂ emissions for this route"
      values={{
        co2value,
      }}
    />
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
  const showCo2Info =
    config.showCO2InItinerarySummary &&
    co2value !== null &&
    co2value >= 0 &&
    !containsScooterLeg;

  const gotFeedback = props.feedback !== undefined;
  const itineraryContainerOverflowRef = createRef();
  const [showOverflowIcon, setShowOverflowIcon] = useState(false);
  const [isExpanded, setIsExpanded] = useState(gotFeedback);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    // If the itinerary length exceeds its boundaries an icon with dots is displayed.
    if (
      itineraryContainerOverflowRef.current.clientWidth <
      itineraryContainerOverflowRef.current.scrollWidth
    ) {
      setShowOverflowIcon(true);
    } else {
      setShowOverflowIcon(false);
    }
  }, [itineraryContainerOverflowRef]);

  return (
    <div
      role="listitem"
      className={cx([
        'itinerary-summary-row',
        'cursor-pointer',
        {
          passive,
          'bp-large': breakpoint === 'large',
          'no-border': hideSelectionIndicator,
        },
      ])}
      aria-atomic="true"
    >
      <div className="sr-only">
        <FormattedMessage
          id="summary-page.row-label"
          values={{
            number: props.hash + 1,
          }}
        />
        {summaryDescription}
        {showCo2Info && co2summary}
      </div>
      <div
        className="itinerary-summary-visible"
        style={{ display: 'flex' }}
        data-ticket-type={`${getTicketString(
          itinerary.legs,
          getZones(itinerary.legs),
          config,
        )}`}
      >
        {/* This next clickable region does not have proper accessible role, tabindex and keyboard handler
            because screen reader works weirdly with nested buttons. Same functonality works from the inner button */
        /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div className="itinerary-summary-header">
          <div>
            <div
              className="summary-clickable-area"
              onClick={e => {
                if (mobile(breakpoint)) {
                  e.stopPropagation();
                  onSelectImmediately();
                } else {
                  onSelectActive();
                }
              }}
              onKeyPress={e => isKeyboardSelectionEvent(e) && onSelectActive()}
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
                  {hasCallAgencyLeg && <FormattedMessage id="estimate" />}{' '}
                  {`${departureTime} - ${arrivalTime}`}
                </div>

                <div style={{ flexGrow: 1 }} />
                {config.showDistanceInItinerarySummary && (
                  <div className="itinerary-total-distance">
                    {(getTotalDistance(itinerary) / 1000).toFixed(1)} km
                  </div>
                )}
                {showCo2Info && (
                  <div className="itinerary-co2-value-container">
                    {lowestCo2value === co2value && (
                      <Icon img="icon_co2_leaf" className="co2-leaf" />
                    )}
                    <div className="itinerary-co2-value">{co2value} g</div>
                  </div>
                )}
                <div className="itinerary-duration">
                  {hasCallAgencyLeg && <FormattedMessage id="estimate" />}{' '}
                  {durationToString(intl, duration)}
                </div>
              </div>
              <div
                className="legs-container"
                style={{ '--minus': `${iconLegsInPixels}px` }}
                key="legs"
                aria-hidden="true"
              >
                <div
                  className={cx(
                    'itinerary-legs',
                    showOverflowIcon ? 'overflow-icon' : '',
                  )}
                  style={{ '--plus': `${iconLegsInPercents}%` }}
                  ref={itineraryContainerOverflowRef}
                >
                  {legs}
                </div>
                <div className="overflow-icon-container">
                  {showOverflowIcon && (
                    <Icon img="icon_three-dots" className="overflow-icon" />
                  )}
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
                          config.vehicleRental.networks[bikeNetwork]
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
            {props.giveFeedback && props.recommended && (
              <div
                className={
                  gotFeedback
                    ? ''
                    : `feedback-animated ${isExpanded ? 'open' : ''}`
                }
              >
                <div className={gotFeedback ? '' : 'feedback-motion'}>
                  <div className="feedback-frame">
                    <Feedback
                      recommended={props.recommended}
                      feedback={props.feedback}
                      giveFeedback={props.giveFeedback}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="summary-separator" />
          </div>
          {mobile(breakpoint) !== true && (
            <div
              tabIndex="0"
              role="button"
              title={formatMessage({ id: 'itinerary-page.show-details' })}
              key="arrow"
              className="action-arrow-click-area"
              onClick={e => {
                e.stopPropagation();
                onSelectImmediately();
              }}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && onSelectImmediately()
              }
              aria-label={ariaLabelMessage}
            >
              <div className="action-arrow flex-grow">
                <Icon img="icon_arrow-collapse--right" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Itinerary.propTypes = {
  itinerary: itineraryShape.isRequired,
  refTime: PropTypes.number.isRequired,
  passive: PropTypes.bool,
  focusToHeader: PropTypes.func.isRequired,
  hash: PropTypes.number.isRequired,
  breakpoint: PropTypes.string.isRequired,
  intermediatePlaces: PropTypes.arrayOf(locationShape),
  hideSelectionIndicator: PropTypes.bool,
  lowestCo2value: PropTypes.number,
  viaPoints: PropTypes.arrayOf(locationShape),
  recommended: PropTypes.bool,
  feedback: PropTypes.bool,
  giveFeedback: PropTypes.func,
};

const ItineraryWithBreakpoint = withBreakpoint(Itinerary);

export { ItineraryWithBreakpoint as default, Itinerary as component };
