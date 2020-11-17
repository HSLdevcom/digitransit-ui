/* eslint-disable no-nested-ternary */
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

import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ItinerarySummaryListContainer from './ItinerarySummaryListContainer';
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
    earlierItineraries: PropTypes.arrayOf(
      PropTypes.shape({
        endTime: PropTypes.number,
        startTime: PropTypes.number,
      }),
    ),
    itineraries: PropTypes.arrayOf(
      PropTypes.shape({
        endTime: PropTypes.number,
        startTime: PropTypes.number,
      }),
    ),
    laterItineraries: PropTypes.arrayOf(
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
    bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
    bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
    walking: PropTypes.bool,
    biking: PropTypes.bool,
    showAlternativePlan: PropTypes.bool,
    addLaterItineraries: PropTypes.func.isRequired,
    addEarlierItineraries: PropTypes.func.isRequired,
    separatorPosition: PropTypes.number,
    updateSeparatorPosition: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    activeIndex: 0,
    error: undefined,
    earlierItineraries: [],
    itineraries: [],
    laterItineraries: [],
    walking: false,
    biking: false,
    showAlternativePlan: false,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  state = {
    loadingMoreItineraries: undefined,
  };

  onSelectActive = index => {
    let isbikeAndVehicle;
    if (this.props.params.hash === 'bikeAndVehicle') {
      isbikeAndVehicle = true;
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
        )}${isbikeAndVehicle ? '/bikeAndVehicle/' : ''}`,
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
    if (this.props.params.hash === 'bikeAndVehicle') {
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
    )}${isBikeAndPublic ? '/bikeAndVehicle/' : '/'}`;
    const indexPath = `${getRoutePath(
      this.props.params.from,
      this.props.params.to,
    )}${isBikeAndPublic ? '/bikeAndVehicle/' : '/'}${index}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    this.context.router.push(newState);
  };

  onLater = reversed => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });
    this.setState({ loadingMoreItineraries: reversed ? 'top' : 'bottom' });
    const combinedItineraries = [
      ...(this.props.earlierItineraries || []),
      ...(this.props.itineraries || []),
      ...(this.props.laterItineraries || []),
    ];

    const end = moment.unix(this.props.serviceTimeRange.end);
    const latestDepartureTime = combinedItineraries.reduce(
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

    const params = preparePlanParams(this.props.config)(
      this.context.match.params,
      this.context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
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
        $bikeSpeed: Float
        $optimize: OptimizeType
        $itineraryFiltering: Float
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
          bikeSpeed: $bikeSpeed
          optimize: $optimize
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          allowedBikeRentalNetworks: $allowedBikeRentalNetworks
          locale: $locale
        ) {
          ...ItineraryTab_plan
          itineraries {
            ...ItinerarySummaryListContainer_itineraries
            walkDistance
            duration
            startTime
            endTime
            elevationGained
            elevationLost
            fares {
              cents
              components {
                cents
                fareId
                routes {
                  agency {
                    gtfsId
                    fareUrl
                    name
                  }
                  gtfsId
                }
              }
              type
            }
            legs {
              mode
              ...ItineraryLine_legs
              ...LegAgencyInfo_leg
              from {
                lat
                lon
                name
                vertexType
                bikeRentalStation {
                  networks
                  bikesAvailable
                  lat
                  lon
                  stationId
                }
                stop {
                  gtfsId
                  code
                  platformCode
                  zoneId
                }
              }
              to {
                lat
                lon
                name
                vertexType
                bikeRentalStation {
                  lat
                  lon
                  stationId
                  networks
                  bikesAvailable
                }
                stop {
                  gtfsId
                  code
                  platformCode
                  zoneId
                }
                bikePark {
                  bikeParkId
                  name
                }
              }
              legGeometry {
                length
                points
              }
              intermediatePlaces {
                arrivalTime
                stop {
                  gtfsId
                  lat
                  lon
                  name
                  code
                  platformCode
                  zoneId
                }
              }
              realTime
              realtimeState
              transitLeg
              rentedBike
              startTime
              endTime
              mode
              interlineWithPreviousLeg
              distance
              duration
              intermediatePlace
              route {
                shortName
                color
                gtfsId
                longName
                desc
                agency {
                  gtfsId
                  fareUrl
                  name
                  phone
                }
              }
              trip {
                directionId
                gtfsId
                tripHeadsign
                stoptimesForDate {
                  scheduledDeparture
                }
                pattern {
                  ...RouteLine_pattern
                  code
                }
                stoptimes {
                  pickupType
                  realtimeState
                  stop {
                    gtfsId
                  }
                }
              }
            }
          }
        }
      }
    `;

    fetchQuery(this.props.relayEnvironment, query, tunedParams).then(
      ({ plan: result }) => {
        if (reversed) {
          const reversedItineraries = result.itineraries.slice().reverse(); // Need to copy because result is readonly
          this.props.addEarlierItineraries(reversedItineraries);
          this.setState({
            loadingMoreItineraries: undefined,
          });
          this.context.router.replace({
            ...this.context.match.location,
            state: {
              ...this.context.match.location.state,
              summaryPageSelected: undefined,
            },
          });
        } else {
          this.props.addLaterItineraries(result.itineraries);
          this.setState({
            loadingMoreItineraries: undefined,
          });
        }
        /*
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
          */
        // this.props.setLoading(false);
        /* replaceQueryParams(this.context.router, this.context.match, {
            time: newTime.unix(),
          }); */
      },
    );
    // }
  };

  onEarlier = reversed => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowEarlierItineraries',
      name: null,
    });
    this.setState({ loadingMoreItineraries: reversed ? 'bottom' : 'top' });
    const combinedItineraries = [
      ...(this.props.earlierItineraries || []),
      ...(this.props.itineraries || []),
      ...(this.props.laterItineraries || []),
    ];

    const start = moment.unix(this.props.serviceTimeRange.start);
    const earliestArrivalTime = combinedItineraries.reduce(
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

    const params = preparePlanParams(this.props.config)(
      this.context.match.params,
      this.context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
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
        $bikeSpeed: Float
        $optimize: OptimizeType
        $itineraryFiltering: Float
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
          bikeSpeed: $bikeSpeed
          optimize: $optimize
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          allowedBikeRentalNetworks: $allowedBikeRentalNetworks
          locale: $locale
        ) {
          ...ItineraryTab_plan
          itineraries {
            ...ItinerarySummaryListContainer_itineraries
            walkDistance
            duration
            startTime
            endTime
            elevationGained
            elevationLost
            fares {
              cents
              components {
                cents
                fareId
                routes {
                  agency {
                    gtfsId
                    fareUrl
                    name
                  }
                  gtfsId
                }
              }
              type
            }
            legs {
              mode
              ...ItineraryLine_legs
              ...LegAgencyInfo_leg
              from {
                lat
                lon
                name
                vertexType
                bikeRentalStation {
                  networks
                  bikesAvailable
                  lat
                  lon
                  stationId
                }
                stop {
                  gtfsId
                  code
                  platformCode
                  zoneId
                }
              }
              to {
                lat
                lon
                name
                vertexType
                bikeRentalStation {
                  lat
                  lon
                  stationId
                  networks
                  bikesAvailable
                }
                stop {
                  gtfsId
                  code
                  platformCode
                  zoneId
                }
                bikePark {
                  bikeParkId
                  name
                }
              }
              legGeometry {
                length
                points
              }
              intermediatePlaces {
                arrivalTime
                stop {
                  gtfsId
                  lat
                  lon
                  name
                  code
                  platformCode
                  zoneId
                }
              }
              realTime
              realtimeState
              transitLeg
              rentedBike
              startTime
              endTime
              mode
              interlineWithPreviousLeg
              distance
              duration
              intermediatePlace
              route {
                shortName
                color
                gtfsId
                longName
                desc
                agency {
                  gtfsId
                  fareUrl
                  name
                  phone
                }
              }
              trip {
                directionId
                gtfsId
                tripHeadsign
                stoptimesForDate {
                  scheduledDeparture
                }
                pattern {
                  ...RouteLine_pattern
                  code
                }
                stoptimes {
                  pickupType
                  realtimeState
                  stop {
                    gtfsId
                  }
                }
              }
            }
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
        }

        if (reversed) {
          this.props.updateSeparatorPosition(
            this.props.separatorPosition
              ? this.props.separatorPosition + result.itineraries.length
              : result.itineraries.length,
          );
          this.setState({
            loadingMoreItineraries: undefined,
          });
          this.props.addLaterItineraries(result.itineraries);
        } else {
          // Reverse the results so that route suggestions are in ascending order
          const reversedItineraries = result.itineraries.slice().reverse(); // Need to copy because result is readonly
          this.props.addEarlierItineraries(reversedItineraries);
          this.props.updateSeparatorPosition(
            this.props.separatorPosition
              ? this.props.separatorPosition + reversedItineraries.length
              : reversedItineraries.length,
          );
          this.setState({
            loadingMoreItineraries: undefined,
          });
          this.context.router.replace({
            ...this.context.match.location,
            state: {
              ...this.context.match.location.state,
              summaryPageSelected: undefined,
            },
          });
        }
      },
    );
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

  laterButton(reversed = false) {
    return (
      <>
        <button
          type="button"
          aria-label={this.context.intl.formatMessage({
            id: 'set-time-later-button-label',
            defaultMessage: 'Set travel time to later',
          })}
          className={`time-navigation-btn ${
            reversed ? 'top-btn' : 'bottom-btn'
          }`}
          onClick={() => this.onLater(reversed)}
        >
          <Icon
            img="icon-icon_arrow-collapse"
            className={`cursor-pointer back ${reversed ? 'arrow-up' : ''}`}
          />
          <FormattedMessage
            id="later"
            defaultMessage="Later"
            className="time-navigation-text"
          />
        </button>
      </>
    );
  }

  earlierButton(reversed = false) {
    return (
      <>
        <button
          type="button"
          aria-label={this.context.intl.formatMessage({
            id: 'set-time-earlier-button-label',
            defaultMessage: 'Set travel time to earlier',
          })}
          className={`time-navigation-btn ${
            reversed ? 'bottom-btn' : 'top-btn'
          }`}
          onClick={() => this.onEarlier(reversed)}
        >
          <Icon
            img="icon-icon_arrow-collapse"
            className={`cursor-pointer ${reversed ? '' : 'arrow-up'}`}
          />
          <FormattedMessage
            id="earlier"
            defaultMessage="Earlier"
            className="time-navigation-text"
          />
        </button>
      </>
    );
  }

  render() {
    const { location } = this.context.match;
    const { from, to } = this.props.params;
    const {
      activeIndex,
      currentTime,
      locationState,
      earlierItineraries,
      itineraries,
      laterItineraries,
      bikeAndPublicItinerariesToShow,
      bikeAndParkItinerariesToShow,
      walking,
      biking,
      showAlternativePlan,
      separatorPosition,
      loading,
    } = this.props;
    const combinedItineraries = [
      ...(earlierItineraries || []),
      ...(itineraries || []),
      ...(laterItineraries || []),
    ];
    const searchTime =
      this.props.plan.date ||
      (location.query &&
        location.query.time &&
        moment.unix(location.query.time).valueOf()) ||
      currentTime;
    const disableButtons =
      !combinedItineraries || combinedItineraries.length === 0;
    const arriveBy = this.context.match.location.query.arriveBy === 'true';

    return (
      <div className="summary">
        <h2 className="sr-only">
          <FormattedMessage
            id="itinerary-summary-page.description"
            defaultMessage="Route suggestions"
          />
        </h2>
        {(this.context.match.params.hash &&
          this.context.match.params.hash === 'bikeAndVehicle') ||
        disableButtons
          ? null
          : arriveBy
          ? this.laterButton(true)
          : this.earlierButton()}
        <ItinerarySummaryListContainer
          activeIndex={activeIndex}
          currentTime={currentTime}
          locationState={locationState}
          error={this.props.error}
          from={otpToLocation(from)}
          intermediatePlaces={getIntermediatePlaces(location.query)}
          itineraries={combinedItineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          searchTime={searchTime}
          to={otpToLocation(to)}
          bikeAndPublicItinerariesToShow={bikeAndPublicItinerariesToShow}
          bikeAndParkItinerariesToShow={bikeAndParkItinerariesToShow}
          walking={walking}
          biking={biking}
          showAlternativePlan={showAlternativePlan}
          separatorPosition={separatorPosition}
          loadingMoreItineraries={this.state.loadingMoreItineraries}
          loading={loading}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        {(this.context.match.params.hash &&
          this.context.match.params.hash === 'bikeAndVehicle') ||
        disableButtons
          ? null
          : arriveBy
          ? this.earlierButton(true)
          : this.laterButton()}
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
    currentTime: context.getStore(TimeStore).getCurrentTime().valueOf(),
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
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
          route {
            gtfsId
          }
          trip {
            gtfsId
            directionId
            stoptimesForDate {
              scheduledDeparture
            }
            pattern {
              ...RouteLine_pattern
            }
          }
        }
      }
    `,
  },
);

export { connectedContainer as default, SummaryPlanContainer as Component };
