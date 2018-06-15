import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';
import moment from 'moment';
import getContext from 'recompose/getContext';
import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
import TimeNavigationButtons from './TimeNavigationButtons';
import { getRoutePath } from '../util/path';
import Loading from './Loading';
import { preparePlanParams } from '../util/planParamUtil';
import { getDefaultOTPModes } from '../util/modeUtils';
import withBreakpoint from '../util/withBreakpoint';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    plan: PropTypes.object.isRequired,
    itineraries: PropTypes.array.isRequired,
    children: PropTypes.node,
    error: PropTypes.string,
    setLoading: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string,
    }).isRequired,
    config: PropTypes.object.isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  onSelectActive = index => {
    if (this.getActiveIndex() === index) {
      this.onSelectImmediately(index);
    } else {
      this.context.router.replace({
        ...this.context.location,
        state: { summaryPageSelected: index },
        pathname: getRoutePath(this.props.params.from, this.props.params.to),
      });
    }
  };

  onSelectImmediately = index => {
    if (Number(this.props.params.hash) === index) {
      if (this.props.breakpoint === 'large') {
        this.context.router.replace({
          ...this.context.location,
          pathname: getRoutePath(this.props.params.from, this.props.params.to),
        });
      } else {
        this.context.router.goBack();
      }
    } else {
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
    const end = moment.unix(this.props.serviceTimeRange.end);
    const latestDepartureTime = this.props.itineraries.reduce(
      (previous, current) => {
        const startTime = moment(current.startTime);

        if (previous == null) {
          return startTime;
        } else if (startTime.isAfter(previous)) {
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
      this.context.router.replace({
        ...this.context.location,
        query: {
          ...this.context.location.query,
          time: latestDepartureTime.unix(),
        },
      });
    } else {
      this.props.setLoading(true);
      const params = preparePlanParams(this.props.config)(
        this.context.router.params,
        this.context,
      );

      const tunedParams = {
        ...{ modes: getDefaultOTPModes(this.props.config) },
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

          this.props.setLoading(false);
          this.context.router.replace({
            ...this.context.location,
            query: {
              ...this.context.location.query,
              time: moment(max)
                .add(1, 'minutes')
                .unix(),
            },
          });
        }
      });
    }
  };

  onEarlier = () => {
    this.props.setLoading(true);
    const start = moment.unix(this.props.serviceTimeRange.start);

    const earliestArrivalTime = this.props.itineraries.reduce(
      (previous, current) => {
        const endTime = moment(current.endTime);

        if (previous == null) {
          return endTime;
        } else if (endTime.isBefore(previous)) {
          return endTime;
        }
        return previous;
      },
      null,
    );

    earliestArrivalTime.subtract(1, 'minutes');

    if (this.context.location.query.arriveBy === true) {
      // user has arriveBy already
      this.context.router.replace({
        ...this.context.location,
        query: {
          ...this.context.location.query,
          time: earliestArrivalTime.unix(),
        },
      });
    } else {
      const params = preparePlanParams(this.props.config)(
        this.context.router.params,
        this.context,
      );

      const tunedParams = {
        ...{ modes: getDefaultOTPModes(this.props.config) },
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
            let min = data[0].plan.itineraries.reduce(
              (previous, { startTime }) =>
                startTime < previous ? startTime : previous,
              Number.MAX_VALUE,
            );
            min = moment(min).subtract(1, 'minutes');

            if (min <= start) {
              // Start time out of range
              this.props.setError('no-route-start-date-too-early');
              this.props.setLoading(false);
              return;
            }

            this.props.setLoading(false);
            this.context.router.replace({
              ...this.context.location,
              query: {
                ...this.context.location.query,
                time: moment(min).unix(),
              },
            });
          }
        }
      });
    }
  };

  onNow = () => {
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        time: moment().unix(),
        arriveBy: false, // XXX
      },
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
      $preferred:InputPreferred!,
      $fromPlace:String!,
      $toPlace:String!
      $date: String!,
      $time: String!,
      $arriveBy: Boolean!,
      $modes: String!,
      $transferPenalty: Int!,
      $itineraryFiltering: Float!,
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
          wheelchair:false,
          disableRemainingWeightHeuristic:false,
          arriveBy:$arriveBy,
          preferred:$preferred,
          modes:$modes
          transferPenalty:$transferPenalty,
          itineraryFiltering:$itineraryFiltering,
        ) {itineraries {startTime,endTime}}
      }
    }`;

  getActiveIndex() {
    if (this.context.location.state) {
      return this.context.location.state.summaryPageSelected || 0;
    }
    /*
     * If state does not exist, for example when accessing the summary
     * page by an external link, we check if an itinerary selection is
     * supplied in URL and make that the active selection.
     */
    const lastURLSegment = this.context.location.pathname.split('/').pop();
    return Number.isNaN(Number(lastURLSegment)) ? 0 : Number(lastURLSegment);
  }

  render() {
    const currentTime = this.context
      .getStore('TimeStore')
      .getCurrentTime()
      .valueOf();
    const activeIndex = this.getActiveIndex();
    if (!this.props.itineraries && this.props.error === null) {
      return <Loading />;
    }

    return (
      <div className="summary">
        <ItinerarySummaryListContainer
          searchTime={this.props.plan.date}
          itineraries={this.props.itineraries}
          currentTime={currentTime}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          activeIndex={activeIndex}
          open={Number(this.props.params.hash)}
          error={this.props.error}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        <TimeNavigationButtons
          onEarlier={this.onEarlier}
          onLater={this.onLater}
          onNow={this.onNow}
          itineraries={this.props.itineraries}
        />
      </div>
    );
  }
}

const withConfig = getContext({
  config: PropTypes.object.isRequired,
})(withBreakpoint(SummaryPlanContainer));

export default Relay.createContainer(withConfig, {
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
