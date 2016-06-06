import React from 'react';
import WalkLeg from './walk-leg';
import WaitLeg from './wait-leg';
import BicycleLeg from './bicycle-leg';
import EndLeg from './end-leg';
import AirportCheckInLeg from './airport-check-in-leg';
import AirportCollectLuggageLeg from './airport-collect-luggage-leg';
import StopCode from '../stop-code';
import BusLeg from './bus-leg';
import AirplaneLeg from './airplane-leg';
import SubwayLeg from './subway-leg';
import TramLeg from './tram-leg';
import RailLeg from './rail-leg';
import FerryLeg from './ferry-leg';
import CarLeg from './car-leg';
import config from '../../../config';

class ItineraryLegs extends React.Component {
  constructor() {
    super();
    this.continueWithBicycle = this.continueWithBicycle.bind(this);
    this.continueWithRentedBicycle = this.continueWithRentedBicycle.bind(this);
  }

  stopCode(stop) {
    return stop && stop.code && <StopCode code={stop.code} />;
  }

  continueWithBicycle(leg1, leg2) {
    return (
      (leg1 != null && (leg1.mode === 'BICYCLE' || leg1.mode === 'WALK'))
      && (leg2 != null && (leg2.mode === 'BICYCLE' || leg2.mode === 'WALK'))
    );
  }

  continueWithRentedBicycle(leg1, leg2) {
    return (
      (leg1 != null && leg1.rentedBike) && (leg2 != null && leg2.rentedBike)
    );
  }

  render() {
    let waitTime;
    let startTime;
    let previousLeg;
    let nextLeg;
    const waitThreshold = config.itinerary.waitThreshold * 1000;
    const legs = [];
    const usingOwnBicycle = (
      ((this.props.itinerary.legs[0]) != null) &&
      (this.props.itinerary.legs[0].mode === 'BICYCLE' &&
      !this.props.itinerary.legs[0].rentedBike)
    );
    const originalLegs = this.props.itinerary.legs;
    const compressedLegs = [];
    let compressLeg = false;

    for (const cleg of originalLegs) {
      if (compressLeg) {
        if (usingOwnBicycle && this.continueWithBicycle(compressLeg, cleg)) {
          compressLeg.duration += cleg.duration;
          compressLeg.distance += cleg.distance;
          compressLeg.to = cleg.to;
          compressLeg.endTime = cleg.endTime;
          compressLeg.mode = 'BICYCLE';
        } else if (cleg.rentedBike && this.continueWithRentedBicycle(compressLeg, cleg)) {
          compressLeg.duration += cleg.duration;
          compressLeg.distance += cleg.distance;
          compressLeg.to = cleg.to;
          compressLeg.endTime += cleg.endTime;
          compressLeg.mode = 'CITYBIKE';
        } else {
          if (usingOwnBicycle && compressLeg.mode === 'WALK') {
            compressLeg.mode = 'BICYCLE_WALK';
          }

          compressedLegs.push(compressLeg);
          compressLeg = cleg;
        }
      } else {
        compressLeg = cleg;
      }
    }

    if (compressLeg) {
      compressedLegs.push(compressLeg);
    }

    const numberOfLegs = compressedLegs.length;

    const focus = (position) => () => this.props.focusMap(position.lat, position.lon);

    compressedLegs.forEach((leg, j) => {
      if (j + 1 < compressedLegs.length) {
        nextLeg = compressedLegs[j + 1];
      }

      if (j > 0) {
        previousLeg = compressedLegs[j - 1];
      }

      if (leg.mode === 'BUS') {
        legs.push(
          <BusLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'TRAM') {
        legs.push(
          <TramLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'FERRY') {
        legs.push(
          <FerryLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'RAIL') {
        legs.push(
          <RailLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'SUBWAY') {
        legs.push(
          <SubwayLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'AIRPLANE') {
        startTime = (previousLeg != null ? previousLeg.endTime : void 0) || leg.startTime;

        legs.push(
          <AirportCheckInLeg
            key={`${j}ci`}
            leg={leg}
            startTime={startTime}
            focusAction={focus(leg.from)}
          />);

        legs.push(
          <AirplaneLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);

        legs.push(
          <AirportCollectLuggageLeg
            key={`${j}cl`}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.rentedBike || leg.mode === 'BICYCLE' || leg.mode === 'BICYCLE_WALK') {
        legs.push(
          <BicycleLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          />);
      } else if (leg.mode === 'CAR') {
        legs.push(
          <CarLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </CarLeg>);
      } else {
        legs.push(
          <WalkLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </WalkLeg>);
      }

      if (nextLeg) {
        waitTime = nextLeg.startTime - leg.endTime;
      }

      if (waitTime > waitThreshold &&
        (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' && leg.mode !== 'AIRPLANE') {
        legs.push(
          <WaitLeg
            key={`${j}w`}
            leg={leg}
            startTime={leg.endTime}
            waitTime={waitTime}
            focusAction={focus(leg.to)}
          >
            {this.stopCode(leg.from.stop)}
          </WaitLeg>);
      }
    });

    legs.push(
      <EndLeg
        key={numberOfLegs}
        index={numberOfLegs}
        endTime={this.props.itinerary.endTime}
        focusAction={focus(compressedLegs[numberOfLegs - 1].to)}
        to={compressedLegs[numberOfLegs - 1].to.name}
      />);

    return <div>{legs}</div>;
  }
}

ItineraryLegs.propTypes = {
  itinerary: React.PropTypes.object,
  focusMap: React.PropTypes.func,
};

export default ItineraryLegs;
