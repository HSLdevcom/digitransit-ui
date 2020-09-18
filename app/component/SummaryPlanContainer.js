import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {
  graphql,
  createFragmentContainer,
  fetchQuery,
  ReactRelayContext,
} from 'react-relay';
import { matchShape, routerShape } from 'found';
import getContext from 'recompose/getContext';

import { FormattedMessage } from 'react-intl';
import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';
import TimeStore from '../store/TimeStore';
import PositionStore from '../store/PositionStore';
import { otpToLocation, getIntermediatePlaces } from '../util/otpStrings';
import { getRoutePath } from '../util/path';
import { replaceQueryParams } from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { preparePlanParams } from '../util/planParamUtil';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    children: PropTypes.node,
    config: PropTypes.object.isRequired,
    currentTime: PropTypes.number.isRequired,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    itineraries: PropTypes.arrayOf(
      PropTypes.shape({
        endTime: PropTypes.number,
        startTime: PropTypes.number,
      }),
    ),
    locationState: PropTypes.object,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string,
      secondHash: PropTypes.string,
    }).isRequired,
    plan: PropTypes.shape({ date: PropTypes.number }), // eslint-disable-line
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    setError: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    relayEnvironment: PropTypes.object,
    toggleSettings: PropTypes.func.isRequired,
    bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
    bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
    walking: PropTypes.bool,
    biking: PropTypes.bool,
    showAlternativePlan: PropTypes.bool,
  };

  static defaultProps = {
    activeIndex: 0,
    error: undefined,
    itineraries: [],
    walking: false,
    biking: false,
    showAlternativePlan: false,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  onSelectActive = index => {
    let isBikeAndPublic;
    if (this.props.params.hash === 'bikeAndPublic') {
      isBikeAndPublic = true;
    }
    if (this.props.activeIndex === index) {
      this.onSelectImmediately(index);
    } else {
      this.context.router.replace({
        ...this.context.match.location,
        state: { summaryPageSelected: index },
        pathname: `${getRoutePath(
          this.props.params.from,
          this.props.params.to,
        )}${isBikeAndPublic ? '/bikeAndPublic/' : ''}`,
      });

      addAnalyticsEvent({
        category: 'Itinerary',
        action: 'HighlightItinerary',
        name: index,
      });
    }
  };

  onSelectImmediately = index => {
    let isBikeAndPublic;
    if (this.props.params.hash === 'bikeAndPublic') {
      isBikeAndPublic = true;
    }
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });
    const newState = {
      ...this.context.match.location,
      state: { summaryPageSelected: index },
    };
    const basePath = `${getRoutePath(
      this.props.params.from,
      this.props.params.to,
    )}${isBikeAndPublic ? '/bikeAndPublic/' : '/'}`;
    const indexPath = `${getRoutePath(
      this.props.params.from,
      this.props.params.to,
    )}${isBikeAndPublic ? '/bikeAndPublic/' : '/'}${index}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    this.context.router.push(newState);
  };

  onLater = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });

    const end = moment.unix(this.props.serviceTimeRange.end);
    const latestDepartureTime = this.props.itineraries.reduce(
      (previous, current) => {
        const startTime = moment(current.startTime);

        if (previous == null) {
          return startTime;
        }
        if (startTime.isAfter(previous)) {
          return startTime;
        }
        return previous;
      },
      null,
    );

    latestDepartureTime.add(1, 'minutes');

    if (latestDepartureTime >= end) {
      // Departure time is going beyond available time range
      this.props.setError('no-route-end-date-not-in-range');
      this.props.setLoading(false);
      return;
    }

    if (this.context.match.location.query.arriveBy !== 'true') {
      // user does not have arrive By
      replaceQueryParams(this.context.router, this.context.match, {
        time: latestDepartureTime.unix(),
      });
    } else {
      this.props.setLoading(true);
      const params = preparePlanParams(this.props.config)(
        this.context.match.params,
        this.context.match,
      );

      const tunedParams = {
        wheelchair: null,
        ...params,
        numItineraries:
          this.props.itineraries.length > 0 ? this.props.itineraries.length : 3,
        arriveBy: false,
        date: latestDepartureTime.format('YYYY-MM-DD'),
        time: latestDepartureTime.format('HH:mm'),
      };

      const query = graphql`
        query SummaryPlanContainer_later_Query(
          $fromPlace: String!
          $toPlace: String!
          $intermediatePlaces: [InputCoordinates!]
          $numItineraries: Int!
          $modes: [TransportMode!]
          $date: String!
          $time: String!
          $walkReluctance: Float
          $walkBoardCost: Int
          $minTransferTime: Int
          $walkSpeed: Float
          $maxWalkDistance: Float
          $wheelchair: Boolean
          $ticketTypes: [String]
          $disableRemainingWeightHeuristic: Boolean
          $arriveBy: Boolean
          $transferPenalty: Int
          $ignoreRealtimeUpdates: Boolean
          $maxPreTransitTime: Int
          $walkOnStreetReluctance: Float
          $waitReluctance: Float
          $bikeSpeed: Float
          $bikeSwitchTime: Int
          $bikeSwitchCost: Int
          $bikeBoardCost: Int
          $optimize: OptimizeType
          $triangle: InputTriangle
          $carParkCarLegWeight: Float
          $maxTransfers: Int
          $waitAtBeginningFactor: Float
          $heuristicStepsPerMainStep: Int
          $compactLegsByReversedSearch: Boolean
          $itineraryFiltering: Float
          $modeWeight: InputModeWeight
          $preferred: InputPreferred
          $unpreferred: InputUnpreferred
          $allowedBikeRentalNetworks: [String]
          $locale: String
        ) {
          plan(
            fromPlace: $fromPlace
            toPlace: $toPlace
            intermediatePlaces: $intermediatePlaces
            numItineraries: $numItineraries
            transportModes: $modes
            date: $date
            time: $time
            walkReluctance: $walkReluctance
            walkBoardCost: $walkBoardCost
            minTransferTime: $minTransferTime
            walkSpeed: $walkSpeed
            maxWalkDistance: $maxWalkDistance
            wheelchair: $wheelchair
            allowedTicketTypes: $ticketTypes
            disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
            arriveBy: $arriveBy
            transferPenalty: $transferPenalty
            ignoreRealtimeUpdates: $ignoreRealtimeUpdates
            maxPreTransitTime: $maxPreTransitTime
            walkOnStreetReluctance: $walkOnStreetReluctance
            waitReluctance: $waitReluctance
            bikeSpeed: $bikeSpeed
            bikeSwitchTime: $bikeSwitchTime
            bikeSwitchCost: $bikeSwitchCost
            bikeBoardCost: $bikeBoardCost
            optimize: $optimize
            triangle: $triangle
            carParkCarLegWeight: $carParkCarLegWeight
            maxTransfers: $maxTransfers
            waitAtBeginningFactor: $waitAtBeginningFactor
            heuristicStepsPerMainStep: $heuristicStepsPerMainStep
            compactLegsByReversedSearch: $compactLegsByReversedSearch
            itineraryFiltering: $itineraryFiltering
            modeWeight: $modeWeight
            preferred: $preferred
            unpreferred: $unpreferred
            allowedBikeRentalNetworks: $allowedBikeRentalNetworks
            locale: $locale
          ) {
            itineraries {
              endTime
            }
          }
        }
      `;

      fetchQuery(this.props.relayEnvironment, query, tunedParams).then(
        ({ plan: result }) => {
          const max = result.itineraries.reduce(
            (previous, { endTime }) =>
              endTime > previous ? endTime : previous,
            Number.MIN_VALUE,
          );

          // OTP can't always find later routes. This leads to a situation where
          // new search is done without increasing time, and nothing seems to happen
          let newTime;
          if (this.props.plan.date >= max) {
            newTime = moment(this.props.plan.date).add(5, 'minutes');
          } else {
            newTime = moment(max).add(1, 'minutes');
          }

          this.props.setLoading(false);
          replaceQueryParams(this.context.router, this.context.match, {
            time: newTime.unix(),
          });
        },
      );
    }
  };

  onEarlier = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowEarlierItineraries',
      name: null,
    });

    const start = moment.unix(this.props.serviceTimeRange.start);
    const earliestArrivalTime = this.props.itineraries.reduce(
      (previous, current) => {
        const endTime = moment(current.endTime);
        if (previous == null) {
          return endTime;
        }
        if (endTime.isBefore(previous)) {
          return endTime;
        }
        return previous;
      },
      null,
    );

    earliestArrivalTime.subtract(1, 'minutes');
    if (earliestArrivalTime <= start) {
      this.props.setError('no-route-start-date-too-early');
      this.props.setLoading(false);
      return;
    }

    if (this.context.match.location.query.arriveBy === 'true') {
      // user has arriveBy already
      replaceQueryParams(this.context.router, this.context.match, {
        time: earliestArrivalTime.unix(),
      });
    } else {
      this.props.setLoading(true);

      const params = preparePlanParams(this.props.config)(
        this.context.match.params,
        this.context.match,
      );

      const tunedParams = {
        wheelchair: null,
        ...params,
        numItineraries:
          this.props.itineraries.length > 0 ? this.props.itineraries.length : 3,
        arriveBy: true,
        date: earliestArrivalTime.format('YYYY-MM-DD'),
        time: earliestArrivalTime.format('HH:mm'),
      };

      const query = graphql`
        query SummaryPlanContainer_earlier_Query(
          $fromPlace: String!
          $toPlace: String!
          $intermediatePlaces: [InputCoordinates!]
          $numItineraries: Int!
          $modes: [TransportMode!]
          $date: String!
          $time: String!
          $walkReluctance: Float
          $walkBoardCost: Int
          $minTransferTime: Int
          $walkSpeed: Float
          $maxWalkDistance: Float
          $wheelchair: Boolean
          $ticketTypes: [String]
          $disableRemainingWeightHeuristic: Boolean
          $arriveBy: Boolean
          $transferPenalty: Int
          $ignoreRealtimeUpdates: Boolean
          $maxPreTransitTime: Int
          $walkOnStreetReluctance: Float
          $waitReluctance: Float
          $bikeSpeed: Float
          $bikeSwitchTime: Int
          $bikeSwitchCost: Int
          $bikeBoardCost: Int
          $optimize: OptimizeType
          $triangle: InputTriangle
          $carParkCarLegWeight: Float
          $maxTransfers: Int
          $waitAtBeginningFactor: Float
          $heuristicStepsPerMainStep: Int
          $compactLegsByReversedSearch: Boolean
          $itineraryFiltering: Float
          $modeWeight: InputModeWeight
          $preferred: InputPreferred
          $unpreferred: InputUnpreferred
          $allowedBikeRentalNetworks: [String]
          $locale: String
        ) {
          plan(
            fromPlace: $fromPlace
            toPlace: $toPlace
            intermediatePlaces: $intermediatePlaces
            numItineraries: $numItineraries
            transportModes: $modes
            date: $date
            time: $time
            walkReluctance: $walkReluctance
            walkBoardCost: $walkBoardCost
            minTransferTime: $minTransferTime
            walkSpeed: $walkSpeed
            maxWalkDistance: $maxWalkDistance
            wheelchair: $wheelchair
            allowedTicketTypes: $ticketTypes
            disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
            arriveBy: $arriveBy
            transferPenalty: $transferPenalty
            ignoreRealtimeUpdates: $ignoreRealtimeUpdates
            maxPreTransitTime: $maxPreTransitTime
            walkOnStreetReluctance: $walkOnStreetReluctance
            waitReluctance: $waitReluctance
            bikeSpeed: $bikeSpeed
            bikeSwitchTime: $bikeSwitchTime
            bikeSwitchCost: $bikeSwitchCost
            bikeBoardCost: $bikeBoardCost
            optimize: $optimize
            triangle: $triangle
            carParkCarLegWeight: $carParkCarLegWeight
            maxTransfers: $maxTransfers
            waitAtBeginningFactor: $waitAtBeginningFactor
            heuristicStepsPerMainStep: $heuristicStepsPerMainStep
            compactLegsByReversedSearch: $compactLegsByReversedSearch
            itineraryFiltering: $itineraryFiltering
            modeWeight: $modeWeight
            preferred: $preferred
            unpreferred: $unpreferred
            allowedBikeRentalNetworks: $allowedBikeRentalNetworks
            locale: $locale
          ) {
            itineraries {
              startTime
            }
          }
        }
      `;

      fetchQuery(this.props.relayEnvironment, query, tunedParams).then(
        ({ plan: result }) => {
          if (result.itineraries.length === 0) {
            // Could not find routes arriving at original departure time
            // --> cannot calculate earlier start time
            this.props.setError('no-route-start-date-too-early');
            this.props.setLoading(false);
          } else {
            const earliestStartTime = result.itineraries.reduce(
              (previous, { startTime }) =>
                startTime < previous ? startTime : previous,
              Number.MAX_VALUE,
            );

            // OTP can't always find earlier routes. This leads to a situation where
            // new search is done without reducing time, and nothing seems to happen
            let newTime;
            if (this.props.plan.date <= earliestStartTime) {
              newTime = moment(this.props.plan.date).subtract(5, 'minutes');
            } else {
              newTime = moment(earliestStartTime).subtract(1, 'minutes');
            }

            if (earliestStartTime <= start) {
              // Start time out of range
              this.props.setError('no-route-start-date-too-early');
              this.props.setLoading(false);
              return;
            }

            this.props.setLoading(false);
            replaceQueryParams(this.context.router, this.context.match, {
              time: newTime.unix(),
            });
          }
        },
      );
    }
  };

  onNow = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ResetJourneyStartTime',
      name: null,
    });

    replaceQueryParams(this.context.router, this.context.match, {
      time: moment().unix(),
      arriveBy: false, // XXX
    });
  };

  render() {
    const { location } = this.context.match;
    const { from, to } = this.props.params;
    const {
      activeIndex,
      currentTime,
      locationState,
      itineraries,
      toggleSettings,
      bikeAndPublicItinerariesToShow,
      bikeAndParkItinerariesToShow,
      walking,
      biking,
      showAlternativePlan,
    } = this.props;
    const searchTime =
      this.props.plan.date ||
      (location.query &&
        location.query.time &&
        moment(location.query.time).unix()) ||
      currentTime;
    const disableButtons = !itineraries || itineraries.length === 0;
    return (
      <div className="summary">
        <h2 className="sr-only">
          <FormattedMessage
            id="itinerary-summary-page.description"
            defaultMessage="Route suggestions"
          />
        </h2>
        <ItinerarySummaryListContainer
          activeIndex={activeIndex}
          currentTime={currentTime}
          locationState={locationState}
          error={this.props.error}
          from={otpToLocation(from)}
          intermediatePlaces={getIntermediatePlaces(location.query)}
          itineraries={itineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          searchTime={searchTime}
          to={otpToLocation(to)}
          toggleSettings={toggleSettings}
          bikeAndPublicItinerariesToShow={bikeAndPublicItinerariesToShow}
          bikeAndParkItinerariesToShow={bikeAndParkItinerariesToShow}
          walking={walking}
          biking={biking}
          showAlternativePlan={showAlternativePlan}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        {this.context.match.params.hash &&
        this.context.match.params.hash === 'bikeAndPublic' ? null : (
          <TimeNavigationButtons
            isEarlierDisabled={disableButtons}
            isLaterDisabled={disableButtons}
            onEarlier={this.onEarlier}
            onLater={this.onLater}
            onNow={this.onNow}
          />
        )}
      </div>
    );
  }
}

const withConfig = getContext({
  config: PropTypes.object.isRequired,
})(
  withBreakpoint(props => (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <SummaryPlanContainer {...props} relayEnvironment={environment} />
      )}
    </ReactRelayContext.Consumer>
  )),
);

const connectedContainer = createFragmentContainer(
  connectToStores(withConfig, [TimeStore, PositionStore], context => ({
    currentTime: context
      .getStore(TimeStore)
      .getCurrentTime()
      .valueOf(),
    locationState: context.getStore(PositionStore).getLocationState(),
  })),
  {
    plan: graphql`
      fragment SummaryPlanContainer_plan on Plan {
        date
      }
    `,
    itineraries: graphql`
      fragment SummaryPlanContainer_itineraries on Itinerary
        @relay(plural: true) {
        ...ItinerarySummaryListContainer_itineraries
        endTime
        startTime
        legs {
          mode
          to {
            bikePark {
              bikeParkId
              name
            }
          }
        }
      }
    `,
  },
);

export { connectedContainer as default, SummaryPlanContainer as Component };
