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
import CarpoolLeg from './CarpoolLeg';
import CarParkLeg from './CarParkLeg';
import ViaLeg from './ViaLeg';
import CallAgencyLeg from './CallAgencyLeg';
import { itineraryHasCancelation } from '../util/alertUtils';
import { compressLegs, isCallAgencyPickupType } from '../util/legUtils';
import updateShowCanceledLegsBannerState from '../action/CanceledLegsBarActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import ItineraryProfile from './ItineraryProfile';
import BikeParkLeg from './BikeParkLeg';
import FunicularLeg from './FunicularLeg';

class ItineraryLegs extends React.Component {
  static childContextTypes = {
    focusFunction: PropTypes.func,
  };

  static propTypes = {
    focusToPoint: PropTypes.func,
    itinerary: PropTypes.object,
    fares: PropTypes.array,
    toggleCanceledLegsBanner: PropTypes.func.isRequired,
    waitThreshold: PropTypes.number.isRequired,
    focusToLeg: PropTypes.func,
    toggleCarpoolDrawer: PropTypes.func,
  };

  static defaultProps = {
    fares: [],
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
    this.props.focusToPoint(position.lat, position.lon);
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'ZoomMapToStopLocation',
      name: null,
    });
  };

  isLegOnFoot = leg => {
    return leg.mode === 'WALK';
  };

  focusToLeg = leg => e => {
    e.stopPropagation();
    this.props.focusToLeg(leg);
  };

  stopCode = stop => stop && stop.code && <StopCode code={stop.code} />;

  printItinerary = e => {
    e.stopPropagation();
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'Print',
      name: null,
    });
    window.print();
  };

  render() {
    const { itinerary, fares, waitThreshold, toggleCarpoolDrawer } = this.props;
    const compressedLegs = compressLegs(itinerary.legs, true).map(leg => ({
      ...leg,
      fare:
        (leg.route &&
          fares.find(fare => fare.routeGtfsId === leg.route.gtfsId)) ||
        undefined,
    }));
    const numberOfLegs = compressedLegs.length;
    const bikeParked = compressedLegs.some(
      leg => leg.to.bikePark || leg.from.bikePark,
    );
    if (numberOfLegs === 0) {
      return null;
    }
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
      const startTime = (previousLeg && previousLeg.endTime) || leg.startTime;
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
      const isNextLegInterlining = nextLeg
        ? nextLeg.interlineWithPreviousLeg
        : false;
      const bikePark = previousLeg?.to.bikePark;
      const carPark = previousLeg?.to.carPark;
      const fromBikePark = leg?.from.bikePark;
      const fromCarPark = leg?.from.carPark || previousLeg?.to.carPark;
      const showBicycleWalkLeg = () => {
        return (
          nextLeg?.mode === 'RAIL' ||
          nextLeg?.mode === 'SUBWAY' ||
          previousLeg?.mode === 'RAIL' ||
          previousLeg?.mode === 'SUBWAY'
        );
      };
      if (fromCarPark && !this.isLegOnFoot(leg)) {
        legs.push(
          <CarParkLeg
            index={j}
            leg={previousLeg}
            carPark={fromCarPark}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
            noWalk
          />,
        );
      }

      if (leg.mode !== 'WALK' && isCallAgencyPickupType(leg)) {
        legs.push(
          <CallAgencyLeg
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.intermediatePlace) {
        legs.push(
          <ViaLeg
            index={j}
            leg={leg}
            arrivalTime={startTime}
            previousLeg={previousLeg}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
          />,
        );
      } else if (bikePark) {
        legs.push(
          <BikeParkLeg
            index={j}
            leg={leg} // TODO arrival time??
            bikePark={bikePark}
            previousLeg={previousLeg}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
          />,
        );
      } else if (carPark && this.isLegOnFoot(leg)) {
        legs.push(
          <CarParkLeg
            index={j}
            leg={leg}
            carPark={carPark}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
          />,
        );
      } else if (this.isLegOnFoot(leg)) {
        if (fromBikePark) {
          legs.push(
            <BikeParkLeg
              index={j}
              leg={leg}
              bikePark={fromBikePark}
              focusAction={this.focus(leg.from)}
              focusToLeg={this.focusToLeg(leg)}
            />,
          );
        } else {
          legs.push(
            <WalkLeg
              index={j}
              leg={leg}
              previousLeg={previousLeg}
              focusAction={this.focus(leg.from)}
              focusToLeg={this.focusToLeg(leg)}
              startTime={startTime}
            >
              {this.stopCode(leg.from.stop)}
            </WalkLeg>,
          );
        }
      } else if (leg.mode === 'BUS' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <BusLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'TRAM' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <TramLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'FERRY' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <FerryLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'FUNICULAR' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <FunicularLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'RAIL' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <RailLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'SUBWAY' && !leg.interlineWithPreviousLeg) {
        legs.push(
          <SubwayLeg
            index={j}
            leg={leg}
            interliningLegs={interliningLegs}
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'AIRPLANE') {
        legs.push(
          <AirportCheckInLeg
            leg={leg}
            startTime={startTime}
            focusAction={this.focus(leg.from)}
          />,
        );

        legs.push(
          <AirplaneLeg
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
          />,
        );

        legs.push(
          <AirportCollectLuggageLeg
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
            startTime: 0,
            endTime: 0,
            distance: -1,
            rentedBike: leg.rentedBike,
            to: leg.to,
            from,
            mode: 'BICYCLE_WALK',
          };
        }
        legs.push(
          <BicycleLeg
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
            bicycleWalkLeg={bicycleWalkLeg}
            arrivedAtDestinationWithRentedBicycle={
              itinerary.arrivedAtDestinationWithRentedBicycle
            }
            startTime={startTime}
            previousLeg={previousLeg}
          />,
        );
      } else if (leg.mode === 'CAR') {
        legs.push(
          <CarLeg
            index={j}
            leg={leg}
            focusAction={this.focus(leg.from)}
            focusToLeg={this.focusToLeg(leg)}
            toggleCarpoolDrawer={toggleCarpoolDrawer}
            startTime={startTime}
            previousLeg={previousLeg}
          >
            {this.stopCode(leg.from.stop)}
          </CarLeg>,
        );
      } else if (leg.mode === 'CARPOOL') {
        legs.push(
          <CarpoolLeg index={j} leg={leg} focusAction={this.focus(leg.from)}>
            {this.stopCode(leg.from.stop)}
          </CarpoolLeg>,
        );
      }

      if (nextLeg) {
        const waitThresholdInMs = waitThreshold * 1000;
        const waitTime = nextLeg.startTime - leg.endTime;

        if (
          waitTime > waitThresholdInMs &&
          (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' &&
          leg.mode !== 'AIRPLANE' &&
          leg.mode !== 'CAR' &&
          !nextLeg.intermediatePlace &&
          !isNextLegInterlining &&
          leg.to.stop &&
          !isNextLegInterlining
        ) {
          legs.push(
            <WaitLeg
              index={j}
              leg={leg}
              startTime={leg.endTime}
              previousLeg={previousLeg}
              waitTime={waitTime}
              focusAction={this.focus(leg.to)}
            >
              {this.stopCode(leg.to.stop)}
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
          {this.stopCode(compressedLegs[numberOfLegs - 1].to.stop)}
        </WalkLeg>,
      );
    }

    legs.push(
      <EndLeg
        index={numberOfLegs}
        endTime={itinerary.endTime}
        focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
        to={compressedLegs[numberOfLegs - 1].to}
      />,
    );

    legs.push(
      <ItineraryProfile
        itinerary={itinerary}
        printItinerary={this.printItinerary}
      />,
    );

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

export { enhancedComponent as default, ItineraryLegs as Component };
