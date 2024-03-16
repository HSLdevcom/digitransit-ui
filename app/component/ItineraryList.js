import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { matchShape } from 'found';
import Icon from './Icon';
import Itinerary from './Itinerary';
import { isBrowser } from '../util/browser';
import { getExtendedMode, getZones } from '../util/legUtils';
import ItineraryListHeader from './ItineraryListHeader';
import { LocationShape } from '../util/shapes';
import Loading from './Loading';
import RoutingFeedbackPrompt from './RoutingFeedbackPrompt';
import { streetHash } from '../util/path';

const spinnerPosition = {
  top: 'top',
  bottom: 'bottom',
};

function ItineraryList(
  {
    activeIndex,
    currentTime,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    searchTime,
    bikeAndParkItineraryCount,
    showRelaxedPlanNotifier,
    separatorPosition,
    loadingMore,
    routingFeedbackPosition,
  },
  context,
) {
  const { config } = context;
  const { hash } = context.match.params;

  const lowestCo2value = Math.round(
    itineraries
      .filter(itinerary => itinerary.emissionsPerPerson?.co2 >= 0)
      .reduce((a, b) => {
        return a.emissionsPerPerson?.co2 < b.emissionsPerPerson?.co2 ? a : b;
      }, 0).emissionsPerPerson?.co2,
  );
  const summaries = itineraries.map((itinerary, i) => (
    <Itinerary
      refTime={searchTime}
      key={i} // eslint-disable-line react/no-array-index-key
      hash={i}
      data={itinerary}
      passive={i !== activeIndex}
      currentTime={currentTime}
      onSelect={onSelect}
      onSelectImmediately={onSelectImmediately}
      intermediatePlaces={intermediatePlaces}
      hideSelectionIndicator={i !== activeIndex || itineraries.length === 1}
      zones={
        config.zones.stops && itinerary.legs ? getZones(itinerary.legs) : []
      }
      lowestCo2value={lowestCo2value}
    />
  ));

  if (hash === streetHash.parkAndRide) {
    summaries.splice(
      0,
      0,
      <ItineraryListHeader
        translationId="leave-your-car-park-and-ride"
        defaultMessage="Park & Ride"
        key="itinerary-summary.parkride-title"
      />,
    );
  }
  if (hash === streetHash.bikeAndVehicle) {
    // bikeAndParkItineraryCount tells how many first itineraries use bike parking
    if (bikeAndParkItineraryCount > 0) {
      summaries.splice(
        0,
        0,
        <ItineraryListHeader
          translationId="itinerary-summary.bikePark-title"
          defaultMessage="Biking \u0026 public transport \u0026 walking"
          key="itinerary-summary.bikepark-title"
        />,
      );
    }
    if (itineraries.length > bikeAndParkItineraryCount) {
      // the rest use bike + public
      const mode =
        getExtendedMode(
          itineraries[bikeAndParkItineraryCount].legs.find(l => l.transitLeg),
          config,
        ) || 'rail';
      summaries.splice(
        bikeAndParkItineraryCount ? bikeAndParkItineraryCount + 1 : 0,
        0,
        <ItineraryListHeader
          translationId={`itinerary-summary.bikeAndPublic-${mode}-title`}
          defaultMessage="Biking \u0026 public transport"
          key="itinerary-summary.bikeandpublic-title"
        />,
      );
    }
  }
  if (separatorPosition) {
    summaries.splice(
      separatorPosition,
      0,
      <div
        className="summary-list-separator"
        key={`summary-list-separator-${separatorPosition}`}
      />,
    );
  }
  if (routingFeedbackPosition) {
    summaries.splice(
      routingFeedbackPosition,
      0,
      <RoutingFeedbackPrompt key="feedback-prompt" />,
    );
  }
  return (
    <div className="summary-list-container" role="list">
      {showRelaxedPlanNotifier && (
        <div
          className={cx(
            'flex-horizontal',
            'summary-notification',
            'show-alternatives',
          )}
        >
          <Icon className="icon-icon_settings" img="icon-icon_settings" />
          <div>
            <FormattedMessage
              id="no-route-showing-alternative-options"
              defaultMessage="No routes with current settings found. Here are some alternative options:"
            />
          </div>
        </div>
      )}
      {loadingMore === spinnerPosition.top && (
        <div className="summary-list-spinner-container">
          <Loading />
        </div>
      )}
      {isBrowser && (
        <div
          className={cx('summary-list-items', {
            'summary-list-items-loading-top':
              loadingMore === spinnerPosition.top,
          })}
        >
          {summaries}
        </div>
      )}
      {loadingMore === spinnerPosition.bottom && (
        <div className="summary-list-spinner-container">
          <Loading />
        </div>
      )}
    </div>
  );
}

ItineraryList.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  intermediatePlaces: PropTypes.arrayOf(LocationShape),
  itineraries: PropTypes.arrayOf(PropTypes.object),
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  searchTime: PropTypes.number.isRequired,
  bikeAndParkItineraryCount: PropTypes.number.isRequired,
  showRelaxedPlanNotifier: PropTypes.bool,
  separatorPosition: PropTypes.number,
  loadingMore: PropTypes.string,
  routingFeedbackPosition: PropTypes.number,
};

ItineraryList.defaultProps = {
  intermediatePlaces: [],
  itineraries: [],
  showRelaxedPlanNotifier: false,
  separatorPosition: undefined,
  loadingMore: undefined,
  routingFeedbackPosition: undefined,
};

ItineraryList.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

const containerComponent = createFragmentContainer(ItineraryList, {
  itineraries: graphql`
    fragment ItineraryList_itineraries on Itinerary @relay(plural: true) {
      walkDistance
      startTime
      endTime
      emissionsPerPerson {
        co2
      }
      legs {
        realTime
        realtimeState
        transitLeg
        startTime
        endTime
        mode
        distance
        duration
        rentedBike
        interlineWithPreviousLeg
        intermediatePlace
        intermediatePlaces {
          stop {
            zoneId
          }
        }
        route {
          mode
          shortName
          type
          color
          agency {
            name
          }
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
        }
        trip {
          pattern {
            code
          }
          stoptimes {
            realtimeState
            stop {
              gtfsId
            }
            pickupType
          }
          occupancy {
            occupancyStatus
          }
        }
        from {
          name
          lat
          lon
          stop {
            gtfsId
            zoneId
            platformCode
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
            }
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
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
            }
          }
          bikePark {
            bikeParkId
            name
          }
          carPark {
            carParkId
            name
          }
        }
      }
    }
  `,
});

export {
  containerComponent as default,
  ItineraryList as Component,
  spinnerPosition,
};
