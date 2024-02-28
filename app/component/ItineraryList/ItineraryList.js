import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { matchShape } from 'found';
import Icon from '../Icon';
import Itinerary from '../Itinerary';
import { isBrowser } from '../../util/browser';
import { getExtendedMode, getZones } from '../../util/legUtils';
import CanceledItineraryToggler from '../CanceledItineraryToggler';
import { itineraryHasCancelation } from '../../util/alertUtils';
import ItineraryListHeader from './ItineraryListHeader';
import Loading from '../Loading';
import ItinerarySummaryMessage from './ItinerarySummaryMessage';
import LocationShape from '../../prop-types/LocationShape';
import ErrorShape from '../../prop-types/ErrorShape';
import RoutingErrorShape from '../../prop-types/RoutingErrorShape';
import RoutingFeedbackPrompt from '../RoutingFeedbackPrompt';
import { streetHash } from '../../util/path';

const spinnerPosition = {
  top: 'top',
  bottom: 'bottom',
};

function ItineraryList(
  {
    activeIndex,
    currentTime,
    error,
    from,
    to,
    locationState,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    searchTime,
    bikeAndParkItineraryCount,
    walking,
    biking,
    driving,
    showRelaxedPlanNotifier,
    showRentalVehicleNotifier,
    separatorPosition,
    loadingMore,
    routingErrors,
    routingFeedbackPosition,
  },
  context,
) {
  const [showCancelled, setShowCancelled] = useState(false);
  const { config } = context;
  const { hash } = context.match.params;

  if (!error && itineraries.length > 0) {
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
        isCancelled={itineraryHasCancelation(itinerary)}
        showCancelled={showCancelled}
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

    const canceledItinerariesCount = itineraries.filter(
      itineraryHasCancelation,
    ).length;
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
        {showRentalVehicleNotifier && (
          <div
            className={cx(
              'flex-horizontal',
              'e-scooter-or-taxi-info',
              'summary-notification',
            )}
          >
            <Icon className="info-icon" img="icon-icon_info" />
            <div>
              <div className="e-scooter-or-taxi-info-header">
                <FormattedMessage id="no-route-msg" />
              </div>
              <div className="e-scooter-or-taxi-info-content">
                <FormattedMessage
                  id="e-scooter-or-taxi-alternative"
                  values={{
                    paymentInfo: (
                      <FormattedMessage id="payment-info-e-scooter-taxi" />
                    ),
                  }}
                />
              </div>
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
        {isBrowser && canceledItinerariesCount > 0 && (
          <CanceledItineraryToggler
            showItineraries={showCancelled}
            toggleShowCanceled={() => setShowCancelled(!showCancelled)}
            canceledItinerariesAmount={canceledItinerariesCount}
          />
        )}
      </div>
    );
  }
  if (!error) {
    if ((!from.lat || !from.lon) && (!to.lat || !to.lon)) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-start-end"
              defaultMessage="Please select origin and destination"
            />
          </div>
        </div>
      );
    }
    if (!from.lat || !from.lon) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-start"
              defaultMessage="Please select origin"
            />
          </div>
        </div>
      );
    }
    if (!to.lat || !to.lon) {
      return (
        <div className="summary-list-container">
          <div className="summary-no-route-found">
            <FormattedMessage
              id="no-route-end"
              defaultMessage="Please select destination"
            />
          </div>
        </div>
      );
    }
  }

  return (
    <ItinerarySummaryMessage
      walking={walking}
      biking={biking}
      driving={driving}
      error={error}
      from={from}
      locationState={locationState}
      routingErrors={routingErrors}
      searchTime={searchTime}
      currentTime={currentTime}
      to={to}
    />
  );
}

ItineraryList.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  error: ErrorShape,
  routingErrors: PropTypes.arrayOf(RoutingErrorShape),
  from: LocationShape.isRequired,
  intermediatePlaces: PropTypes.arrayOf(LocationShape),
  itineraries: PropTypes.arrayOf(PropTypes.object),
  locationState: LocationShape.isRequired,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  searchTime: PropTypes.number.isRequired,
  to: LocationShape.isRequired,
  bikeAndParkItineraryCount: PropTypes.number.isRequired,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  driving: PropTypes.bool,
  showRelaxedPlanNotifier: PropTypes.bool,
  showRentalVehicleNotifier: PropTypes.bool,
  separatorPosition: PropTypes.number,
  loadingMore: PropTypes.string,
  routingFeedbackPosition: PropTypes.number,
};

ItineraryList.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
  walking: false,
  biking: false,
  driving: false,
  showRelaxedPlanNotifier: false,
  showRentalVehicleNotifier: false,
  separatorPosition: undefined,
  loadingMore: undefined,
  routingErrors: [],
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
          rentalVehicle {
            vehicleId
            name
            lat
            lon
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
