/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { configShape, fareShape, itineraryShape } from '../../util/shapes';
import WalkLeg from './WalkLeg';
import WaitLeg from './WaitLeg';
import BicycleLeg from './BicycleLeg';
import EndLeg from './EndLeg';
import AirportCheckInLeg from './AirportCheckInLeg';
import AirportCollectLuggageLeg from './AirportCollectLuggageLeg';
import StopCode from '../StopCode';
import BusLeg from './BusLeg';
import AirplaneLeg from './AirplaneLeg';
import SubwayLeg from './SubwayLeg';
import TramLeg from './TramLeg';
import RailLeg from './RailLeg';
import FerryLeg from './FerryLeg';
import CarLeg from './CarLeg';
import CarParkLeg from './CarParkLeg';
import ViaLeg from './ViaLeg';
import CallAgencyLeg from './CallAgencyLeg';
import {
  compressLegs,
  isCallAgencyPickupType,
  isLegOnFoot,
  legTime,
} from '../../util/legUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import Profile from './Profile';
import BikeParkLeg from './BikeParkLeg';
import FunicularLeg from './FunicularLeg';

const stopCode = stop => stop && stop.code && <StopCode code={stop.code} />;

export default class Legs extends React.Component {
  static childContextTypes = {
    focusFunction: PropTypes.func,
  };

  static propTypes = {
    itinerary: itineraryShape.isRequired,
    fares: PropTypes.arrayOf(fareShape),
    focusToPoint: PropTypes.func.isRequired,
    focusToLeg: PropTypes.func.isRequired,
    changeHash: PropTypes.func,
    tabIndex: PropTypes.number,
    toggleSettings: PropTypes.func.isRequired,
    showBikeBoardingInformation: PropTypes.bool,
  };

  static contextTypes = { config: configShape };

  static defaultProps = {
    fares: [],
    changeHash: undefined,
    tabIndex: undefined,
    showBikeBoardingInformation: false,
  };

  getChildContext() {
    return { focusFunction: this.focus };
  }

  focus = position => e => {
    e.stopPropagation();
    this.props.focusToPoint(position.lat, position.lon);
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'ZoomMapToStopLocation',
      name: null,
    });
  };

  focusToLeg = leg => e => {
    e.stopPropagation();
    this.props.focusToLeg(leg);
  };

  render() {
    const { itinerary, fares, showBikeBoardingInformation } = this.props;
    const { waitThreshold } = this.context.config.itinerary;

    const compressedLegs = compressLegs(itinerary.legs, true).map(leg => ({
      showBikeBoardingInformation,
      ...leg,
      fare:
        (leg.route &&
          fares?.find(fare => fare.routeGtfsId === leg.route.gtfsId)) ||
        undefined,
    }));
    const numberOfLegs = compressedLegs.length;
    if (numberOfLegs === 0) {
      return null;
    }
    const bikeParked = compressedLegs.some(
      leg => leg.to.vehicleParking && leg.mode === 'BICYCLE',
    );
    let previousLeg;
    let nextLeg;
    const legs = [];
    compressedLegs.forEach((leg, j) => {
      if (j + 1 < compressedLegs.length) {
        nextLeg = compressedLegs[j + 1];
      }
      if (j > 0) {
        previousLeg = compressedLegs[j - 1];
      }
      const startTime = previousLeg?.end || leg.start;
      let index = j;
      const interliningLegs = [];
      // there can be an arbitrary amount of interlining legs, search for the last one
      while (
        compressedLegs[index + 1] &&
        compressedLegs[index + 1].interlineWithPreviousLeg
      ) {
        interliningLegs.push(compressedLegs[index + 1]);
        index += 1;
      }
      const isNextLegInterlining = nextLeg?.interlineWithPreviousLeg;
      const bikePark =
        previousLeg?.mode === 'BICYCLE' && previousLeg.to.vehicleParking;
      const carPark =
        previousLeg?.mode === 'CAR' && previousLeg.to.vehicleParking;
      const showBicycleWalkLeg = () => {
        return (
          this.context.config.showBicycleWalkLegModes.includes(nextLeg?.mode) ||
          this.context.config.showBicycleWalkLegModes.includes(
            previousLeg?.mode,
          )
        );
      };
      const legProps = {
        leg,
        index: j,
        focusAction: this.focus(leg.from),
        focusToLeg: this.focusToLeg(leg),
      };
      const transitLegProps = {
        leg,
        index: j,
        interliningLegs,
        focusAction: this.focus(leg.from),
        changeHash: this.props.changeHash,
        tabIndex: this.props.tabIndex,
      };

      if (leg.mode !== 'WALK' && isCallAgencyPickupType(leg)) {
        legs.push(
          <CallAgencyLeg
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.intermediatePlace) {
        legs.push(<ViaLeg {...legProps} arrival={startTime} />);
      } else if (bikePark) {
        legs.push(<BikeParkLeg {...legProps} bikePark={bikePark} />);
      } else if (carPark) {
        legs.push(<CarParkLeg {...legProps} carPark={carPark} />);
      } else if (isLegOnFoot(leg)) {
        legs.push(
          <WalkLeg {...legProps} previousLeg={previousLeg}>
            {stopCode(leg.from.stop)}
          </WalkLeg>,
        );
      } else if (leg.mode === 'BUS' && !leg.interlineWithPreviousLeg) {
        legs.push(<BusLeg {...transitLegProps} />);
      } else if (leg.mode === 'TRAM' && !leg.interlineWithPreviousLeg) {
        legs.push(<TramLeg {...transitLegProps} />);
      } else if (leg.mode === 'FERRY' && !leg.interlineWithPreviousLeg) {
        legs.push(<FerryLeg {...transitLegProps} />);
      } else if (leg.mode === 'FUNICULAR' && !leg.interlineWithPreviousLeg) {
        legs.push(<FunicularLeg {...transitLegProps} />);
      } else if (leg.mode === 'RAIL' && !leg.interlineWithPreviousLeg) {
        legs.push(<RailLeg {...transitLegProps} />);
      } else if (leg.mode === 'SUBWAY' && !leg.interlineWithPreviousLeg) {
        legs.push(<SubwayLeg {...transitLegProps} />);
      } else if (leg.mode === 'AIRPLANE') {
        legs.push(
          <AirportCheckInLeg
            index={j - 0.5}
            leg={leg}
            start={startTime}
            focusAction={this.focus(leg.from)}
          />,
        );
        legs.push(<AirplaneLeg {...transitLegProps} />);
        legs.push(
          <AirportCollectLuggageLeg
            index={j + 0.5}
            leg={leg}
            focusAction={this.focus(leg.to)}
          />,
        );
      } else if (leg.rentedBike || leg.mode === 'BICYCLE') {
        let bicycleWalkLeg;
        if (nextLeg?.mode === 'BICYCLE_WALK' && !bikeParked) {
          bicycleWalkLeg = nextLeg;
        }
        if (previousLeg?.mode === 'BICYCLE_WALK' && !bikeParked) {
          bicycleWalkLeg = previousLeg;
        }
        // if there is a transit leg after or before a bicycle leg, render a bicycle_walk leg without distance information
        if (showBicycleWalkLeg() && !bikeParked) {
          let { from } = leg;
          if (
            (previousLeg?.mode === 'RAIL' || previousLeg?.mode === 'SUBWAY') &&
            !leg.from.stop
          ) {
            from = previousLeg.to;
          }
          bicycleWalkLeg = {
            duration: 0,
            start: leg.start,
            end: leg.start,
            distance: -1,
            rentedBike: leg.rentedBike,
            to: leg.to,
            from,
            mode: 'BICYCLE_WALK',
          };
        }
        legs.push(
          <BicycleLeg
            {...legProps}
            bicycleWalkLeg={bicycleWalkLeg}
            toggleSettings={this.props.toggleSettings}
          />,
        );
      } else if (leg.mode === 'CAR') {
        legs.push(<CarLeg {...legProps}>{stopCode(leg.from.stop)}</CarLeg>);
      }

      if (nextLeg) {
        const waitThresholdInMs = waitThreshold * 1000;
        const waitTime = legTime(nextLeg.start) - legTime(leg.end);

        if (
          waitTime > waitThresholdInMs &&
          (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' &&
          leg.mode !== 'AIRPLANE' &&
          leg.mode !== 'CAR' &&
          !nextLeg.intermediatePlace &&
          !isNextLegInterlining &&
          leg.to.stop
        ) {
          legs.push(
            <WaitLeg
              index={j}
              leg={leg}
              start={leg.end}
              waitTime={waitTime}
              focusAction={this.focus(leg.to)}
            >
              {stopCode(leg.to.stop)}
            </WaitLeg>,
          );
        }
      }
    });

    // This solves edge case when itinerary ends at the stop without walking.
    // There should be WalkLeg rendered before EndLeg.
    if (
      compressedLegs[numberOfLegs - 1].mode !== 'WALK' &&
      compressedLegs[numberOfLegs - 1].to.stop
    ) {
      legs.push(
        <WalkLeg
          index={numberOfLegs}
          leg={compressedLegs[numberOfLegs - 1]}
          previousLeg={compressedLegs[numberOfLegs - 2]}
          focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
          focusToLeg={this.focusToLeg(compressedLegs[numberOfLegs - 1])}
        >
          {stopCode(compressedLegs[numberOfLegs - 1].to.stop)}
        </WalkLeg>,
      );
    }

    legs.push(
      <EndLeg
        index={numberOfLegs}
        endTime={itinerary.end}
        focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
        to={compressedLegs[numberOfLegs - 1].to}
      />,
    );

    legs.push(<Profile itinerary={itinerary} />);

    return (
      <span className="itinerary-list-container" role="list">
        {legs.map((item, idx) => {
          const listKey = `leg_${idx}`;
          return (
            <span role="listitem" key={listKey}>
              {item}
            </span>
          );
        })}
      </span>
    );
  }
}
