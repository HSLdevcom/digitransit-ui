import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

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
import ViaLeg from './ViaLeg';
import CallAgencyLeg from './CallAgencyLeg';
import { compressLegs, isCallAgencyPickupType } from '../util/legUtils';

class ItineraryLegs extends React.Component {
  static childContextTypes = {
    focusFunction: PropTypes.func,
  };

  getChildContext() {
    return { focusFunction: this.focus };
  }

  focus = position => e => {
    e.stopPropagation();
    this.props.focusMap(position.lat, position.lon);
  };

  stopCode = stop => stop && stop.code && <StopCode code={stop.code} />;

  render() {
    let previousLeg;
    let nextLeg;
    const legs = [];
    const compressedLegs = compressLegs(this.props.itinerary.legs);

    compressedLegs.forEach((leg, j) => {
      if (j + 1 < compressedLegs.length) {
        nextLeg = compressedLegs[j + 1];
      }

      if (j > 0) {
        previousLeg = compressedLegs[j - 1];
      }

      if (isCallAgencyPickupType(leg)) {
        legs.push(
          <CallAgencyLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.intermediatePlace) {
        legs.push(
          <ViaLeg
            key={`${j}via`}
            leg={leg}
            arrivalTime={compressedLegs[j - 1].endTime}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'BUS') {
        legs.push(
          <BusLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'TRAM') {
        legs.push(
          <TramLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'FERRY') {
        legs.push(
          <FerryLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'RAIL') {
        legs.push(
          <RailLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'SUBWAY') {
        legs.push(
          <SubwayLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'AIRPLANE') {
        const startTime = (previousLeg && previousLeg.endTime) || leg.startTime;

        legs.push(
          <AirportCheckInLeg
            key={`${j}ci`}
            leg={leg}
            startTime={startTime}
            focusAction={this.focus(leg.from)}
          />,
        );

        legs.push(
          <AirplaneLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );

        legs.push(
          <AirportCollectLuggageLeg
            key={`${j}cl`}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (
        leg.rentedBike ||
        leg.mode === 'BICYCLE' ||
        leg.mode === 'BICYCLE_WALK'
      ) {
        legs.push(
          <BicycleLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'CAR') {
        legs.push(
          <CarLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </CarLeg>,
        );
      } else {
        legs.push(
          <WalkLeg
            key={j}
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </WalkLeg>,
        );
      }

      if (nextLeg) {
        const waitThreshold =
          this.context.config.itinerary.waitThreshold * 1000;
        const waitTime = nextLeg.startTime - leg.endTime;

        if (
          waitTime > waitThreshold &&
          (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' &&
          leg.mode !== 'AIRPLANE' &&
          !nextLeg.intermediatePlace
        ) {
          legs.push(
            <WaitLeg
              key={`${j}w`}
              leg={leg}
              startTime={leg.endTime}
              waitTime={waitTime}
              focusAction={this.focus(leg.to)}
            >
              {this.stopCode(leg.to.stop)}
            </WaitLeg>,
          );
        }
      }
    });

    const numberOfLegs = compressedLegs.length;
    legs.push(
      <EndLeg
        key={numberOfLegs}
        index={numberOfLegs}
        endTime={this.props.itinerary.endTime}
        focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
        to={compressedLegs[numberOfLegs - 1].to.name}
      />,
    );

    return <React.Fragment>{legs}</React.Fragment>;
  }
}

ItineraryLegs.propTypes = {
  itinerary: PropTypes.object,
  focusMap: PropTypes.func,
};

ItineraryLegs.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default ItineraryLegs;
