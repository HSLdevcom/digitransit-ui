/* eslint-disable no-nested-ternary */
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {
  graphql,
  createFragmentContainer,
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
import { getSummaryPath } from '../util/path';
import { replaceQueryParams } from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { isIOS, isSafari } from '../util/browser';
import SettingsChangedNotification from './SettingsChangedNotification';
import ItineraryShape from '../prop-types/ItineraryShape';
import ErrorShape from '../prop-types/ErrorShape';
import LocationStateShape from '../prop-types/LocationStateShape';
import RoutingErrorShape from '../prop-types/RoutingErrorShape';
import ChildrenShape from '../prop-types/ChildrenShape';

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    children: ChildrenShape,
    currentTime: PropTypes.number.isRequired,
    error: ErrorShape,
    itineraries: PropTypes.arrayOf(ItineraryShape).isRequired,
    locationState: LocationStateShape.isRequired,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string,
      secondHash: PropTypes.string,
    }).isRequired,
    plan: PropTypes.shape({
      date: PropTypes.number,
      itineraries: PropTypes.arrayOf(ItineraryShape),
    }).isRequired,
    routingErrors: PropTypes.arrayOf(RoutingErrorShape),
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
    bikeRentAndPublicItinerariesToShow: PropTypes.number.isRequired,
    bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
    parkAndRide: PropTypes.bool,
    car: PropTypes.bool,
    onDemandTaxi: PropTypes.bool,
    walking: PropTypes.bool,
    biking: PropTypes.bool,
    showAlternativePlan: PropTypes.bool,
    separatorPosition: PropTypes.number,
    loading: PropTypes.bool.isRequired,
    onLater: PropTypes.func.isRequired,
    onEarlier: PropTypes.func.isRequired,
    onDetailsTabFocused: PropTypes.func.isRequired,
    loadingMoreItineraries: PropTypes.string,
    alternativePlan: PropTypes.shape({
      date: PropTypes.number,
      itineraries: PropTypes.arrayOf(ItineraryShape),
    }).isRequired,
    showSettingsChangedNotification: PropTypes.func.isRequired,
    driving: PropTypes.bool,
    onlyHasWalkingItineraries: PropTypes.bool,
  };

  static defaultProps = {
    activeIndex: 0,
    children: null,
    error: undefined,
    walking: false,
    biking: false,
    showAlternativePlan: false,
    loadingMoreItineraries: undefined,
    driving: false,
    routingErrors: [],
    separatorPosition: undefined,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  onSelectActive = index => {
    const subpath = this.getSubPath('');
    if (this.props.activeIndex === index) {
      this.onSelectImmediately(index);
    } else {
      this.context.router.replace({
        ...this.context.match.location,
        state: { summaryPageSelected: index },
        pathname: `${getSummaryPath(
          this.props.params.from,
          this.props.params.to,
        )}${subpath}`,
      });

      addAnalyticsEvent({
        category: 'Itinerary',
        action: 'HighlightItinerary',
        name: index,
      });
    }
  };

  getSubPath(fallback) {
    const modesWithSubpath = ['bikeAndVehicle', 'parkAndRide', 'onDemandTaxi'];
    const { hash } = this.props.params;
    if (modesWithSubpath.includes(hash)) {
      return `/${hash}/`;
    }
    return fallback;
  }

  onSelectImmediately = index => {
    const subpath = this.getSubPath('/');
    // eslint-disable-next-line compat/compat
    const momentumScroll = document.getElementsByClassName(
      'momentum-scroll',
    )[0];
    if (momentumScroll) {
      momentumScroll.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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
    const basePath = `${getSummaryPath(
      this.props.params.from,
      this.props.params.to,
    )}${subpath}`;
    const indexPath = `${getSummaryPath(
      this.props.params.from,
      this.props.params.to,
    )}${subpath}${index}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    this.context.router.push(newState);
    this.props.onDetailsTabFocused();
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
          } ${!reversed && isIOS && isSafari ? 'extra-whitespace' : ''} `}
          onClick={() => this.props.onLater(this.props.itineraries, reversed)}
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
          } ${reversed && isIOS && isSafari ? 'extra-whitespace' : ''}`}
          onClick={() => this.props.onEarlier(this.props.itineraries, reversed)}
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
      itineraries,
      bikeAndPublicItinerariesToShow,
      bikeRentAndPublicItinerariesToShow,
      bikeAndParkItinerariesToShow,
      parkAndRide,
      car,
      onDemandTaxi,
      walking,
      biking,
      showAlternativePlan,
      separatorPosition,
      loading,
      loadingMoreItineraries,
      driving,
      onlyHasWalkingItineraries,
    } = this.props;
    const searchTime =
      this.props.plan?.date ||
      (location.query &&
        location.query.time &&
        moment.unix(location.query.time).valueOf()) ||
      currentTime;
    const disableButtons = !itineraries || itineraries.length === 0;
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
        disableButtons ||
        onlyHasWalkingItineraries
          ? null
          : arriveBy
          ? this.laterButton(true)
          : this.earlierButton()}
        <ItinerarySummaryListContainer
          activeIndex={activeIndex}
          currentTime={currentTime}
          locationState={locationState}
          error={this.props.error}
          routingErrors={this.props.routingErrors}
          from={otpToLocation(from)}
          intermediatePlaces={getIntermediatePlaces(location.query)}
          itineraries={itineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          searchTime={searchTime}
          to={otpToLocation(to)}
          bikeAndPublicItinerariesToShow={bikeAndPublicItinerariesToShow}
          bikeRentAndPublicItinerariesToShow={
            bikeRentAndPublicItinerariesToShow
          }
          bikeAndParkItinerariesToShow={bikeAndParkItinerariesToShow}
          parkAndRide={parkAndRide}
          car={car}
          onDemandTaxi={onDemandTaxi}
          walking={walking}
          biking={biking}
          showAlternativePlan={showAlternativePlan}
          separatorPosition={separatorPosition}
          loadingMoreItineraries={loadingMoreItineraries}
          loading={loading}
          driving={driving}
          onlyHasWalkingItineraries={onlyHasWalkingItineraries}
        >
          {this.props.children}
        </ItinerarySummaryListContainer>
        {this.props.showSettingsChangedNotification(
          this.props.plan,
          this.props.alternativePlan,
        ) && <SettingsChangedNotification />}
        {(this.context.match.params.hash &&
          this.context.match.params.hash === 'bikeAndVehicle') ||
        disableButtons ||
        onlyHasWalkingItineraries
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
        itineraries {
          startTime
          endTime
          legs {
            mode
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
                pickupType
              }
              pattern {
                ...RouteLine_pattern
              }
            }
            from {
              name
              lat
              lon
              stop {
                gtfsId
                zoneId
              }
              bikeRentalStation {
                bikesAvailable
                networks
              }
            }
            to {
              stop {
                gtfsId
                zoneId
              }
              bikePark {
                bikeParkId
                name
              }
            }
          }
        }
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
