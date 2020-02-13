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
import { exampleData, scooterData } from './data/ItineraryLegs.ExampleData';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class ItineraryLegs extends React.Component {
  static childContextTypes = {
    focusFunction: PropTypes.func,
  };

  static propTypes = {
    focusMap: PropTypes.func,
    itinerary: PropTypes.object,
    fares: PropTypes.array,
    toggleCanceledLegsBanner: PropTypes.func.isRequired,
    waitThreshold: PropTypes.number.isRequired,
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
    this.props.focusMap(position.lat, position.lon);
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'ZoomMapToStopLocation',
      name: null,
    });
  };

  stopCode = stop => stop && stop.code && <StopCode code={stop.code} />;

  render() {
    const { itinerary, fares, waitThreshold } = this.props;

    const compressedLegs = compressLegs(itinerary.legs).map(leg => ({
      ...leg,
      fare:
        (leg.route &&
          fares.find(fare => fare.routeGtfsId === leg.route.gtfsId)) ||
        undefined,
    }));
    const numberOfLegs = compressedLegs.length;
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

      if (isCallAgencyPickupType(leg)) {
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
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (leg.mode === 'BUS') {
        legs.push(
          <BusLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
        );
      } else if (leg.mode === 'TRAM') {
        legs.push(
          <TramLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
        );
      } else if (leg.mode === 'FERRY') {
        legs.push(
          <FerryLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
        );
      } else if (leg.mode === 'RAIL') {
        legs.push(
          <RailLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
        );
      } else if (leg.mode === 'SUBWAY') {
        legs.push(
          <SubwayLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
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
            focusAction={this.focus(leg.from)}
          />,
        );
      } else if (
        leg.rentedBike ||
        leg.mode === 'BICYCLE' ||
        leg.mode === 'BICYCLE_WALK'
      ) {
        legs.push(
          <BicycleLeg index={j} leg={leg} focusAction={this.focus(leg.from)} />,
        );
      } else if (leg.mode === 'CAR') {
        legs.push(
          <CarLeg index={j} leg={leg} focusAction={this.focus(leg.from)}>
            {this.stopCode(leg.from.stop)}
          </CarLeg>,
        );
      } else {
        legs.push(
          <WalkLeg
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
        const waitThresholdInMs = waitThreshold * 1000;
        const waitTime = nextLeg.startTime - leg.endTime;

        if (
          waitTime > waitThresholdInMs &&
          (nextLeg != null ? nextLeg.mode : null) !== 'AIRPLANE' &&
          leg.mode !== 'AIRPLANE' &&
          !nextLeg.intermediatePlace
        ) {
          legs.push(
            <WaitLeg
              index={j}
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
        index={numberOfLegs}
        endTime={itinerary.endTime}
        focusAction={this.focus(compressedLegs[numberOfLegs - 1].to)}
        to={compressedLegs[numberOfLegs - 1].to.name}
      />,
    );

    return (
      <span role="list">
        {legs.map(item => (
          <span
            role="listitem"
            key={`${item.props.leg && item.props.leg.mode}_${item.props.index}`}
          >
            {item}
          </span>
        ))}
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
    <ComponentUsageExample description="Itinerary with a kick scooter leg">
      <ItineraryLegs
        focusMap={() => {}}
        itinerary={scooterData}
        toggleCanceledLegsBanner={() => {}}
        waitThreshold={180}
      />
    </ComponentUsageExample>
  </div>
);

export { enhancedComponent as default, ItineraryLegs as Component };
