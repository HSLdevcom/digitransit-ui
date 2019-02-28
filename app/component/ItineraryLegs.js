/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';

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
import { itineraryHasCancelation } from '../util/alertUtils';
import { compressLegs, isCallAgencyPickupType } from '../util/legUtils';
import updateShowCanceledLegsBannerState from '../action/CanceledLegsBarActions';
import ComponentUsageExample from './ComponentUsageExample';
import { exampleData } from './data/ItineraryLegs.ExampleData';

class ItineraryLegs extends React.Component {
  static childContextTypes = {
    focusFunction: PropTypes.func,
  };

  static propTypes = {
    focusMap: PropTypes.func,
    itinerary: PropTypes.object,
    toggleCanceledLegsBanner: PropTypes.func.isRequired,
    waitThreshold: PropTypes.number.isRequired,
  };

  getChildContext() {
    return { focusFunction: this.focus };
  }

  componentDidMount = () => {
    const { itinerary, toggleCanceledLegsBanner } = this.props;
    if (itineraryHasCancelation(itinerary)) {
      toggleCanceledLegsBanner(true);
    }
  };

  componentWillUnmount = () => {
    const { toggleCanceledLegsBanner } = this.props;
    toggleCanceledLegsBanner(false);
  };

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
    const numberOfLegs = compressedLegs.length;
    if (numberOfLegs === 0) {
      return null;
    }

    compressedLegs.forEach((leg, j) => {
      if (j + 1 < compressedLegs.length) {
        nextLeg = compressedLegs[j + 1];
      }
      if (j > 0) {
        previousLeg = compressedLegs[j - 1];
      }
      const startTime = (previousLeg && previousLeg.endTime) || leg.startTime;

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
            index={j}
            leg={leg}
            arrivalTime={startTime}
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
            previousLeg={previousLeg}
            focusAction={this.focus(leg.from)}
          >
            {this.stopCode(leg.from.stop)}
          </WalkLeg>,
        );
      }

      if (nextLeg) {
        const waitThreshold = this.props.waitThreshold * 1000;
        const waitTime = nextLeg.startTime - leg.endTime;

        if (
          waitTime > waitThreshold &&
          (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' &&
          leg.mode !== 'AIRPLANE' &&
          !nextLeg.intermediatePlace
        ) {
          legs.push(
            <WaitLeg
              index={j}
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

const enhancedComponent = compose(
  getContext({
    config: PropTypes.shape({
      itinerary: PropTypes.shape({
        waitThreshold: PropTypes.number,
      }),
    }),
    executeAction: PropTypes.func,
  }),
  mapProps(({ config, executeAction, ...rest }) => ({
    toggleCanceledLegsBanner: state => {
      executeAction(updateShowCanceledLegsBannerState, state);
    },
    waitThreshold: config.itinerary.waitThreshold,
    ...rest,
  })),
)(ItineraryLegs);

ItineraryLegs.description = () => (
  <div>
    <p>Legs shown for the itinerary</p>
    <ComponentUsageExample description="Shows the legs of the itinerary">
      <ItineraryLegs
        focusMap={() => {}}
        itinerary={exampleData}
        toggleCanceledLegsBanner={() => {}}
        waitThreshold={180}
      />
    </ComponentUsageExample>
  </div>
);

export { enhancedComponent as default, ItineraryLegs as Component };
