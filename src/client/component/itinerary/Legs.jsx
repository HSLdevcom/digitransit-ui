/* eslint-disable react/no-array-index-key */
import cx from 'classnames';
import PropTypes from 'prop-types';
import { useRouter } from 'found';
import { fareShape, itineraryShape, relayShape } from '../../utils/shapes';
import TransitLeg from './TransitLeg';
import WalkLeg from './WalkLeg';
import WaitLeg from './WaitLeg';
import BicycleLeg from './BicycleLeg';
import EndLeg from './EndLeg';
import AirportCheckInLeg from './AirportCheckInLeg';
import AirportCollectLuggageLeg from './AirportCollectLuggageLeg';
import StopCode from '../StopCode';
import CarLeg from './CarLeg';
import CarParkLeg from './CarParkLeg';
import ViaLeg from './ViaLeg';
import CallAgencyLeg from './CallAgencyLeg';
import TaxiLeg from './TaxiLeg';
import {
  compressLegs,
  isCallAgencyLeg,
  isTaxiLeg,
  isWalkLeg,
  legTime,
  markViaPoints,
  getBoardingLeg,
  isUsingOwnCarWholeTrip,
  LegMode,
} from '../../utils/legUtils';
import { getTripOrRouteMode } from '../../utils/modeUtils';
import { addAnalyticsEvent } from '../../../shared/utils/analyticsUtils';
import ItineraryTotals from './ItineraryTotals';
import BikeParkLeg from './BikeParkLeg';
import { getIntermediatePlaces } from '../../../shared/utils/otpStrings';
import { useConfigContext } from '../../hooks/ConfigContext';

const stopCode = stop => stop?.code && <StopCode code={stop.code} />;

// there can be an arbitrary amount of interlining legs following the given leg
function getInterliningLegs(legs, index) {
  const interliningLegs = [];
  for (let i = index + 1; legs[i]?.interlineWithPreviousLeg; i++) {
    interliningLegs.push(legs[i]);
  }
  return interliningLegs;
}

export default function Legs({
  itinerary,
  fares,
  focusToPoint,
  focusToLeg,
  changeHash,
  tabIndex,
  openSettings,
  showBikeBoardingInformation,
  showCarBoardingInformation,
  relayEnvironment,
}) {
  const config = useConfigContext();
  const { match } = useRouter();

  const focus = position => e => {
    e.stopPropagation();
    focusToPoint(position.lat, position.lon);
    addAnalyticsEvent({ category: 'Itinerary', action: 'ZoomMapToStopLocation', name: null });
  };

  const focusLeg = leg => e => {
    e.stopPropagation();
    focusToLeg(leg);
  };

  const usingOwnCarWholeTrip = isUsingOwnCarWholeTrip(itinerary.legs);
  const waitThresholdInMs = config.itinerary.waitThreshold * 1000;
  const { location } = match;
  const intermediatePlaces = getIntermediatePlaces(location.query);
  const itineraryLegs = markViaPoints(itinerary.legs, intermediatePlaces);

  const compressedLegs = compressLegs(itineraryLegs, true).map(leg => ({
    showBikeBoardingInformation,
    showCarBoardingInformation,
    ...leg,
    fare: (leg.route && fares?.find(fare => fare.routeGtfsId === leg.route.gtfsId)) || undefined,
  }));

  const numberOfLegs = compressedLegs.length;
  if (numberOfLegs === 0) {
    return null;
  }

  const bikeParked = compressedLegs.some(
    leg => leg.to.vehicleParking && leg.mode === LegMode.Bicycle,
  );

  // Returns a WaitLeg element when the passenger waits between the leg and the next one.
  const createWaitLeg = (leg, nextLeg, j) => {
    if (!nextLeg) {
      return undefined;
    }
    const waitTime = legTime(nextLeg.start) - legTime(leg.end);
    const isSameStopTransfer =
      leg.transitLeg && nextLeg.transitLeg && leg.to.stop.gtfsId === nextLeg.from.stop.gtfsId;

    if (
      !(waitTime > waitThresholdInMs || isSameStopTransfer) ||
      nextLeg.mode === LegMode.Airplane ||
      leg.mode === LegMode.Airplane ||
      nextLeg.intermediatePlace ||
      nextLeg.interlineWithPreviousLeg ||
      !leg.to.stop
    ) {
      return undefined;
    }

    return (
      <WaitLeg
        index={j}
        leg={{ ...leg, isViaPoint: leg.isViaPoint || nextLeg.isViaPoint }}
        start={leg.end}
        waitTime={waitTime}
        focusAction={focus(leg.to)}
        icon={usingOwnCarWholeTrip ? 'icon_wait-car' : 'icon_wait_standing'}
        hasPreviousTransitLeg={leg.transitLeg}
      >
        {stopCode(leg.to.stop)}
      </WaitLeg>
    );
  };

  const legs = [];

  compressedLegs.forEach((leg, j) => {
    const previousLeg = compressedLegs[j - 1];
    const nextLeg = compressedLegs[j + 1];

    const startTime = previousLeg?.end || leg.start;
    const bikePark = previousLeg?.mode === LegMode.Bicycle && previousLeg.to.vehicleParking;
    const carPark = previousLeg?.mode === LegMode.Car && previousLeg.to.vehicleParking;

    const focusFrom = focus(leg.from);
    const legProps = { leg, index: j, focusAction: focusFrom, focusToLeg: focusLeg(leg) };

    const transitLegProps = {
      leg,
      index: j,
      interliningLegs: leg.transitLeg ? getInterliningLegs(compressedLegs, j) : [],
      focusAction: focusFrom,
      changeHash,
      tabIndex,
      usingOwnCarWholeTrip,
    };

    const waitLeg = createWaitLeg(leg, nextLeg, j);
    if (waitLeg && nextLeg.isViaPoint) {
      // the via point is shown on the wait leg instead of the next leg
      nextLeg.isViaPoint = false;
    }

    if (isCallAgencyLeg(leg)) {
      legs.push(<CallAgencyLeg {...transitLegProps} />);
    } else if (leg.intermediatePlace) {
      legs.push(<ViaLeg {...legProps} arrival={startTime} />);
    } else if (bikePark) {
      legs.push(<BikeParkLeg {...legProps} bikePark={bikePark} />);
    } else if (carPark) {
      legs.push(<CarParkLeg {...legProps} carPark={carPark} />);
    } else if (isTaxiLeg(leg)) {
      legs.push(<TaxiLeg {...legProps} />);
    } else if (isWalkLeg(leg)) {
      legs.push(
        <WalkLeg
          {...legProps}
          previousLeg={previousLeg}
          nextLeg={nextLeg}
          focusToPoint={focusToPoint}
        >
          {stopCode(leg.from.stop)}
        </WalkLeg>,
      );
    } else if (leg.mode === LegMode.Airplane) {
      legs.push(
        <AirportCheckInLeg index={j - 0.5} leg={leg} start={startTime} focusAction={focusFrom} />,
      );
      legs.push(<TransitLeg mode="airplane" omitDivider {...transitLegProps} />);
      legs.push(<AirportCollectLuggageLeg index={j + 0.5} leg={leg} focusAction={focus(leg.to)} />);
    } else if (leg.transitLeg && !leg.interlineWithPreviousLeg) {
      const mode = getTripOrRouteMode(
        leg.trip,
        { mode: leg.mode, type: leg.route.type, gtfsId: leg.route.gtfsId },
        config,
      );

      legs.push(<TransitLeg mode={mode} {...transitLegProps} />);
    } else if (leg.rentedBike || leg.mode === LegMode.Bicycle || leg.mode === LegMode.Scooter) {
      let bicycleWalkLeg;
      if (!bikeParked) {
        // if there is a transit leg after or before a bicycle leg, render a bicycle_walk leg without distance information
        // currently bike walk leg is not rendered if there is waiting at stop, because
        // 'walk bike to train and wait x minutes' is too confusing instruction
        // This cannot be fixed as long as bicycle leg renders also bike walking
        const boardingLeg = getBoardingLeg(nextLeg, previousLeg, waitLeg, leg, LegMode.BicycleWalk);
        const adjacentBikeWalkLeg = [previousLeg, nextLeg].find(
          l => l?.mode === LegMode.BicycleWalk,
        );
        bicycleWalkLeg = boardingLeg ?? adjacentBikeWalkLeg;
      }

      legs.push(
        <BicycleLeg
          {...legProps}
          bicycleWalkLeg={bicycleWalkLeg}
          openSettings={openSettings}
          nextLegMode={nextLeg?.mode}
          relayEnvironment={relayEnvironment}
        />,
      );
    } else if (leg.mode === LegMode.Car) {
      // If there is a transit leg after or before a car leg, render a car boarding leg without distance information.
      const carBoardingLeg = getBoardingLeg(nextLeg, previousLeg, waitLeg, leg, 'CAR_BOARDING');
      legs.push(
        <CarLeg {...legProps} carBoardingLeg={carBoardingLeg}>
          {stopCode(leg.from.stop)}
        </CarLeg>,
      );
    }

    if (waitLeg) {
      legs.push(waitLeg);
    }
  });

  // This solves edge case when itinerary ends at the stop without walking.
  // There should be WalkLeg rendered before EndLeg.
  const lastLeg = compressedLegs[numberOfLegs - 1];
  if (lastLeg.transitLeg && lastLeg.to.stop) {
    legs.push(
      <WalkLeg
        index={numberOfLegs}
        leg={{ ...lastLeg, isViaPoint: false }}
        previousLeg={lastLeg}
        focusAction={focus(lastLeg.to)}
        focusToLeg={focusLeg(lastLeg)}
        focusToPoint={focusToPoint}
      >
        {stopCode(lastLeg.to.stop)}
      </WalkLeg>,
    );
  }

  legs.push(
    <EndLeg
      index={numberOfLegs}
      endTime={itinerary.end}
      focusAction={focus(lastLeg.to)}
      to={lastLeg.to}
    />,
  );

  legs.push(<ItineraryTotals itinerary={itinerary} />);

  const hasCallAgencyLeg = compressedLegs.some(isCallAgencyLeg);

  return (
    <span
      className={cx('itinerary-list-container', { 'has-call-agency-leg': hasCallAgencyLeg })}
      role="list"
    >
      {legs.map((item, idx) => (
        <span role="listitem" key={`leg_${idx}`}>
          {item}
        </span>
      ))}
    </span>
  );
}

Legs.propTypes = {
  itinerary: itineraryShape.isRequired,
  fares: PropTypes.arrayOf(fareShape),
  focusToPoint: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  changeHash: PropTypes.func,
  tabIndex: PropTypes.number,
  openSettings: PropTypes.func.isRequired,
  showBikeBoardingInformation: PropTypes.bool,
  showCarBoardingInformation: PropTypes.bool,
  relayEnvironment: relayShape,
};
