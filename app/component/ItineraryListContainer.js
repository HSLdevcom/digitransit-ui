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
import {
  configShape,
  itineraryShape,
  childrenShape,
  planShape,
} from '../util/shapes';
import Icon from './Icon';
import ItineraryList from './ItineraryList';
import TimeStore from '../store/TimeStore';
import PositionStore from '../store/PositionStore';
import { getIntermediatePlaces } from '../util/otpStrings';
import { getItineraryPagePath, streetHash } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { isIOS, isSafari } from '../util/browser';
import ItineraryNotification from './ItineraryNotification';
import { transitItineraries } from './ItineraryPageUtils';

class ItineraryListContainer extends React.Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    children: childrenShape,
    currentTime: PropTypes.number.isRequired,
    itineraries: PropTypes.arrayOf(itineraryShape).isRequired,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string,
      secondHash: PropTypes.string,
    }).isRequired,
    plan: planShape.isRequired,
    bikeAndParkItineraryCount: PropTypes.number,
    showRelaxedPlanNotifier: PropTypes.bool,
    separatorPosition: PropTypes.number,
    onLater: PropTypes.func.isRequired,
    onEarlier: PropTypes.func.isRequired,
    focusToHeader: PropTypes.func.isRequired,
    loadingMore: PropTypes.string,
    settingsNotification: PropTypes.bool,
    routingFeedbackPosition: PropTypes.number,
    topNote: PropTypes.string,
    bottomNote: PropTypes.string,
  };

  static defaultProps = {
    activeIndex: 0,
    children: null,
    bikeAndParkItineraryCount: 0,
    showRelaxedPlanNotifier: false,
    loadingMore: undefined,
    separatorPosition: undefined,
    routingFeedbackPosition: undefined,
    settingsNotification: false,
    topNote: undefined,
    bottomNote: undefined,
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
        state: { selectedItineraryIndex: index },
        pathname: `${getItineraryPagePath(
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
    const modesWithSubpath = [
      streetHash.bikeAndVehicle,
      streetHash.parkAndRide,
    ];
    const { hash } = this.props.params;
    if (modesWithSubpath.includes(hash)) {
      return `/${hash}/`;
    }
    return fallback;
  }

  onSelectImmediately = index => {
    const subpath = this.getSubPath('/');
    // eslint-disable-next-line compat/compat
    const momentumScroll =
      document.getElementsByClassName('momentum-scroll')[0];
    if (momentumScroll) {
      momentumScroll.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });
    const newLocation = {
      ...this.context.match.location,
      state: { selectedItineraryIndex: index },
    };
    const basePath = `${getItineraryPagePath(
      this.props.params.from,
      this.props.params.to,
    )}${subpath}`;
    const indexPath = `${basePath}${index}`;

    newLocation.pathname = basePath;
    this.context.router.replace(newLocation);
    newLocation.pathname = indexPath;
    this.context.router.push(newLocation);
    this.props.focusToHeader();
  };

  laterButton(reversed = false) {
    return (
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
    );
  }

  earlierButton(reversed = false) {
    return (
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
    );
  }

  renderMoreButton(arriveBy, onTop) {
    if (onTop) {
      return arriveBy ? this.laterButton(true) : this.earlierButton();
    }
    return arriveBy ? this.earlierButton(true) : this.laterButton();
  }

  render() {
    const { location } = this.context.match;
    const {
      activeIndex,
      currentTime,
      itineraries,
      bikeAndParkItineraryCount,
      showRelaxedPlanNotifier,
      separatorPosition,
      loadingMore,
      routingFeedbackPosition,
    } = this.props;
    const searchTime =
      this.props.plan?.date ||
      (location.query &&
        location.query.time &&
        moment.unix(location.query.time).valueOf()) ||
      currentTime;
    const showEarlierLaterButtons =
      transitItineraries(itineraries).length > 0 &&
      !this.context.match.params.hash;
    const arriveBy = this.context.match.location.query.arriveBy === 'true';

    return (
      <div className="summary">
        <h2 className="sr-only">
          <FormattedMessage
            id="itinerary-summary-page.description"
            defaultMessage="Route suggestions"
          />
        </h2>
        {showEarlierLaterButtons && this.renderMoreButton(arriveBy, true)}
        {this.props.topNote && (
          <ItineraryNotification bodyId={this.props.topNote} />
        )}
        <ItineraryList
          activeIndex={activeIndex}
          currentTime={currentTime}
          intermediatePlaces={getIntermediatePlaces(location.query)}
          itineraries={itineraries}
          onSelect={this.onSelectActive}
          onSelectImmediately={this.onSelectImmediately}
          searchTime={searchTime}
          bikeAndParkItineraryCount={bikeAndParkItineraryCount}
          showRelaxedPlanNotifier={showRelaxedPlanNotifier}
          separatorPosition={separatorPosition}
          loadingMore={loadingMore}
          routingFeedbackPosition={routingFeedbackPosition}
        >
          {this.props.children}
        </ItineraryList>
        {this.props.settingsNotification && (
          <ItineraryNotification
            headerId="settings-missing-itineraries-header"
            bodyId="settings-missing-itineraries-body"
            iconId="icon-icon_settings"
          />
        )}
        {this.props.bottomNote && (
          <ItineraryNotification bodyId={this.props.bottomNote} />
        )}
        {showEarlierLaterButtons && this.renderMoreButton(arriveBy, false)}
      </div>
    );
  }
}

const withConfig = getContext({
  config: configShape.isRequired,
})(
  withBreakpoint(props => (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <ItineraryListContainer {...props} relayEnvironment={environment} />
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
      fragment ItineraryListContainer_plan on Plan {
        date
        itineraries {
          startTime
          endTime
          emissionsPerPerson {
            co2
          }
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
              occupancy {
                occupancyStatus
              }
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
              vehicleRentalStation {
                vehiclesAvailable
                network
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
      fragment ItineraryListContainer_itineraries on Itinerary
      @relay(plural: true) {
        ...ItineraryList_itineraries
        endTime
        startTime
        emissionsPerPerson {
          co2
        }
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

export { connectedContainer as default, ItineraryListContainer as Component };
