import React from 'react';

import WalkLeg from './WalkLeg';
import WaitLeg from './WaitLeg';
import BicycleLeg from './BicycleLeg';
import EndLeg from './EndLeg';
import AirportCheckInLeg from './AirportCheckInLeg';
import AirportCollectLuggageLeg from './AirportCollectLuggageLeg';
import StopCode from './StopCode';
import BusLeg from './BusLeg';
import AirplaneLeg from './AirplaneLeg';
import SubwayLeg from './SubwayLeg';
import TramLeg from './TramLeg';
import RailLeg from './RailLeg';
import FerryLeg from './FerryLeg';
import CarLeg from './CarLeg';
import config from '../config';

class ItineraryLegs extends React.Component {

  static childContextTypes = {
    focusFunction: React.PropTypes.func,
  };

  getChildContext() {
    return { focusFunction: this.focus };
  }

  focus = position => (e) => {
    e.stopPropagation();
    this.props.focusMap(position.lat, position.lon);
  };

  stopCode = stop => stop && stop.code && <StopCode code={stop.code} />;

  continueWithBicycle = (leg1, leg2) => (
    (leg1 != null && (leg1.mode === 'BICYCLE' || leg1.mode === 'WALK')) &&
      (leg2 != null && (leg2.mode === 'BICYCLE' || leg2.mode === 'WALK'))
  );

  continueWithRentedBicycle = (leg1, leg2) => (
    (leg1 != null && leg1.rentedBike) && (leg2 != null && leg2.rentedBike)
  );

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

    originalLegs.forEach((cleg) => {
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
    });

    if (compressLeg) {
      compressedLegs.push(compressLeg);
    }

    const numberOfLegs = compressedLegs.length;


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
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'TRAM') {
        legs.push(
          <TramLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'FERRY') {
        legs.push(
          <FerryLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'RAIL') {
        legs.push(
          <RailLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'SUBWAY') {
        legs.push(
          <SubwayLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'AIRPLANE') {
        startTime = (previousLeg && previousLeg.endTime) || leg.startTime;

        legs.push(
          <AirportCheckInLeg
            key={`${j}ci`}
            leg={leg}
            startTime={startTime}
            focusAction={this.focus(leg.from)}
          />);

        legs.push(
          <AirplaneLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);

        legs.push(
          <AirportCollectLuggageLeg
            key={`${j}cl`}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.rentedBike || leg.mode === 'BICYCLE' || leg.mode === 'BICYCLE_WALK') {
        legs.push(
          <BicycleLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />);
      } else if (leg.mode === 'CAR') {
        legs.push(
          <CarLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </CarLeg>);
      } else {
        legs.push(
          <WalkLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
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
            focusAction={this.focus(leg.to)}
          >
            {this.stopCode(leg.to.stop)}
          </WaitLeg>);
      }
    });

    legs.push(
      <EndLeg
        key={numberOfLegs}
        index={numberOfLegs}
        endTime={this.props.itinerary.endTime}
        focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
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
