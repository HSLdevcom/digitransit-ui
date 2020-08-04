import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';
import getContext from 'recompose/getContext';

import { FormattedMessage } from 'react-intl';
import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';
import TimeStore from '../store/TimeStore';
import PositionStore from '../store/PositionStore';
import { otpToLocation } from '../util/otpStrings';
import { getRoutePath } from '../util/path';
import {
  preparePlanParams,
  defaultRoutingSettings,
} from '../util/planParamUtil';
import { getIntermediatePlaces, replaceQueryParams } from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    breakpoint: PropTypes.string.isRequired,
    children: PropTypes.node,
    config: PropTypes.object.isRequired,
    currentTime: PropTypes.number.isRequired,
    error: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ message: PropTypes.string }),
    ]),
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
    }).isRequired,
    plan: PropTypes.shape({ date: PropTypes.number }), // eslint-disable-line
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    setError: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activeIndex: 0,
    error: undefined,
    itineraries: [],
  };

  static contextTypes = {
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  onSelectActive = index => {
    if (this.props.activeIndex === index) {
      this.onSelectImmediately(index);
    } else {
      this.context.router.replace({
        ...this.context.location,
        state: { summaryPageSelected: index },
        pathname: getRoutePath(this.props.params.from, this.props.params.to),
      });
      addAnalyticsEvent({
        category: 'Itinerary',
        action: 'HighlightItinerary',
        name: index,
      });
    }
  };

  onSelectImmediately = index => {
    if (Number(this.props.params.hash) === index) {
      if (this.props.breakpoint === 'large') {
        addAnalyticsEvent({
          event: 'sendMatomoEvent',
          category: 'ItinerarySettings',
          action: 'ItineraryDetailsClick',
          name: 'ItineraryDetailsCollapse',
        });
        this.context.router.replace({
          ...this.context.location,
          pathname: getRoutePath(this.props.params.from, this.props.params.to),
        });
      } else {
        this.context.router.goBack();
      }
    } else {
      addAnalyticsEvent({
        event: 'sendMatomoEvent',
        category: 'Itinerary',
        action: 'OpenItineraryDetails',
        name: index,
      });
      const newState = {
        ...this.context.location,
        state: { summaryPageSelected: index },
      };
      const basePath = getRoutePath(
        this.props.params.from,
        this.props.params.to,
      );
      const indexPath = `${getRoutePath(
        this.props.params.from,
        this.props.params.to,
      )}/${index}`;

      if (this.props.breakpoint === 'large') {
        newState.pathname = indexPath;
        this.context.router.replace(newState);
      } else {
        newState.pathname = basePath;
        this.context.router.replace(newState);
        newState.pathname = indexPath;
        this.context.router.push(newState);
      }
    }
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

    if (this.context.location.query.arriveBy !== 'true') {
      // user does not have arrive By
      replaceQueryParams(this.context.router, {
        time: latestDepartureTime.unix(),
      });
    } else {
      this.props.setLoading(true);
      const params = preparePlanParams(this.props.config)(
        this.context.router.params,
        this.context,
      );

      const tunedParams = {
        wheelchair: null,
        ...defaultRoutingSettings,
        ...params,
        numItineraries:
          this.props.itineraries.length > 0 ? this.props.itineraries.length : 3,
        arriveBy: false,
        date: latestDepartureTime.format('YYYY-MM-DD'),
        time: latestDepartureTime.format('HH:mm'),
      };

      const query = Relay.createQuery(this.getQuery(), tunedParams);

      Relay.Store.primeCache({ query }, status => {
        if (status.ready === true) {
          const data = Relay.Store.readQuery(query);
          const max = data[0].plan.itineraries.reduce(
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
          replaceQueryParams(this.context.router, { time: newTime.unix() });
        }
      });
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

    if (this.context.location.query.arriveBy === 'true') {
      // user has arriveBy already
      replaceQueryParams(this.context.router, {
        time: earliestArrivalTime.unix(),
      });
    } else {
      this.props.setLoading(true);

      const params = preparePlanParams(this.props.config)(
        this.context.router.params,
        this.context,
      );

      const tunedParams = {
        wheelchair: null,
        ...defaultRoutingSettings,
        ...params,
        numItineraries:
          this.props.itineraries.length > 0 ? this.props.itineraries.length : 3,
        arriveBy: true,
        date: earliestArrivalTime.format('YYYY-MM-DD'),
        time: earliestArrivalTime.format('HH:mm'),
      };

      const query = Relay.createQuery(this.getQuery(), tunedParams);

      Relay.Store.primeCache({ query }, status => {
        if (status.ready === true) {
          const data = Relay.Store.readQuery(query);
          if (data[0].plan.itineraries.length === 0) {
            // Could not find routes arriving at original departure time
            // --> cannot calculate earlier start time
            this.props.setError('no-route-start-date-too-early');
            this.props.setLoading(false);
          } else {
            const earliestStartTime = data[0].plan.itineraries.reduce(
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
            replaceQueryParams(this.context.router, { time: newTime.unix() });
          }
        }
      });
    }
  };

  onNow = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ResetJourneyStartTime',
      name: null,
    });

    replaceQueryParams(this.context.router, {
      time: moment().unix(),
      arriveBy: false, // XXX
    });
  };

  getQuery = () => Relay.QL`
    query Plan(
      $intermediatePlaces:[InputCoordinates]!,
      $numItineraries:Int!,
      $walkBoardCost:Int!,
      $minTransferTime:Int!,
      $walkReluctance:Float!,
      $walkSpeed:Float!,
      $maxWalkDistance:Float!,
      $wheelchair:Boolean!,
      $disableRemainingWeightHeuristic:Boolean!,
      $preferred:InputPreferred!,
      $unpreferred: InputUnpreferred!,
      $fromPlace:String!,
      $toPlace:String!
      $date: String!,
      $time: String!,
      $arriveBy: Boolean!,
      $modes: [TransportMode!],
      $transferPenalty: Int!,
      $ignoreRealtimeUpdates: Boolean!,
      $maxPreTransitTime: Int!,
      $walkOnStreetReluctance: Float!,
      $waitReluctance: Float!,
      $bikeSpeed: Float!,
      $bikeSwitchTime: Int!,
      $bikeSwitchCost: Int!,
      $bikeBoardCost: Int!,
      $optimize: OptimizeType!,
      $triangle: InputTriangle!,
      $carParkCarLegWeight: Float!,
      $maxTransfers: Int!,
      $waitAtBeginningFactor: Float!,
      $heuristicStepsPerMainStep: Int!,
      $compactLegsByReversedSearch: Boolean!,
      $itineraryFiltering: Float!,
      $modeWeight: InputModeWeight!,
      $allowedBikeRentalNetworks: [String]!,
      $locale: String!,
    ) { viewer {
        plan(
          fromPlace:$fromPlace,
          toPlace:$toPlace,
          intermediatePlaces:$intermediatePlaces,
          numItineraries:$numItineraries,
          date:$date,
          time:$time,
          walkReluctance:$walkReluctance,
          walkBoardCost:$walkBoardCost,
          minTransferTime:$minTransferTime,
          walkSpeed:$walkSpeed,
          maxWalkDistance:$maxWalkDistance,
          wheelchair:$wheelchair,
          disableRemainingWeightHeuristic:$disableRemainingWeightHeuristic,
          arriveBy:$arriveBy,
          preferred:$preferred,
          unpreferred: $unpreferred,
          transportModes:$modes
          transferPenalty:$transferPenalty,
          ignoreRealtimeUpdates:$ignoreRealtimeUpdates,
          maxPreTransitTime:$maxPreTransitTime,
          walkOnStreetReluctance:$walkOnStreetReluctance,
          waitReluctance:$waitReluctance,
          bikeSpeed:$bikeSpeed,
          bikeSwitchTime:$bikeSwitchTime,
          bikeSwitchCost:$bikeSwitchCost,
          bikeBoardCost:$bikeBoardCost,
          optimize:$optimize,
          triangle:$triangle,
          carParkCarLegWeight:$carParkCarLegWeight,
          maxTransfers:$maxTransfers,
          waitAtBeginningFactor:$waitAtBeginningFactor,
          heuristicStepsPerMainStep:$heuristicStepsPerMainStep,
          compactLegsByReversedSearch:$compactLegsByReversedSearch,
          itineraryFiltering: $itineraryFiltering,
          modeWeight: $modeWeight,
          allowedBikeRentalNetworks: $allowedBikeRentalNetworks,
          locale: $locale,
        ) {itineraries {startTime,endTime}}
      }
    }`;

  render() {
    const { location } = this.context;
    const { from, to } = this.props.params;
    const { activeIndex, currentTime, locationState, itineraries } = this.props;
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
          intermediatePlaces={getIntermediatePlaces(
            this.context.location.query,
          )}
          itineraries={itineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          open={Number(this.props.params.hash)}
          searchTime={searchTime}
          to={otpToLocation(to)}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        <TimeNavigationButtons
          isEarlierDisabled={disableButtons}
          isLaterDisabled={disableButtons}
          onEarlier={this.onEarlier}
          onLater={this.onLater}
          onNow={this.onNow}
        />
      </div>
    );
  }
}

const withConfig = getContext({
  config: PropTypes.object.isRequired,
})(withBreakpoint(SummaryPlanContainer));

const withRelayContainer = Relay.createContainer(withConfig, {
  fragments: {
    plan: () => Relay.QL`
      fragment on Plan {
        date
      }
    `,
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural: true) {
        ${ItinerarySummaryListContainer.getFragment('itineraries')}
        endTime
        startTime
      }
    `,
  },
});

const connectedContainer = connectToStores(
  withRelayContainer,
  [TimeStore, PositionStore],
  context => ({
    currentTime: context
      .getStore(TimeStore)
      .getCurrentTime()
      .valueOf(),
    locationState: context.getStore(PositionStore).getLocationState(),
  }),
);

export { connectedContainer as default, SummaryPlanContainer as Component };
