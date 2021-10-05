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

class SummaryPlanContainer extends React.Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    children: PropTypes.node,
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
    bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
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
  };

  static defaultProps = {
    activeIndex: 0,
    error: undefined,
    itineraries: [],
    walking: false,
    biking: false,
    showAlternativePlan: false,
    loadingMoreItineraries: undefined,
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
    } = this.props;
    const searchTime =
      this.props.plan.date ||
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
          itineraries={itineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          searchTime={searchTime}
          to={otpToLocation(to)}
          bikeAndPublicItinerariesToShow={bikeAndPublicItinerariesToShow}
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
