import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { matchShape } from 'found';

import isEqual from 'lodash/isEqual';
import {
  getCurrentSettings,
  getDefaultSettings,
} from '../../util/planParamUtil';

import Icon from '../Icon';
import SummaryRow from '../SummaryRow';
import { isBrowser } from '../../util/browser';
import { getZones } from '../../util/legUtils';
import CanceledItineraryToggler from '../CanceledItineraryToggler';
import { itineraryHasCancelation } from '../../util/alertUtils';
import { ItinerarySummarySubtitle } from '../ItinerarySummarySubtitle';
import Loading from '../Loading';
import ItinerarySummaryMessage from './components/ItinerarySummaryMessage';
import LocationShape from '../../prop-types/LocationShape';
import ErrorShape from '../../prop-types/ErrorShape';
import RoutingErrorShape from '../../prop-types/RoutingErrorShape';

function ItinerarySummaryListContainer(
  {
    activeIndex,
    currentTime,
    error,
    from,
    locationState,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    searchTime,
    to,
    bikeAndPublicItinerariesToShow,
    bikeRentAndPublicItinerariesToShow,
    bikeAndParkItinerariesToShow,
    walking,
    biking,
    showAlternativePlan,
    separatorPosition,
    loadingMoreItineraries,
    loading,
    driving,
    onlyHasWalkingItineraries,
    routingErrors,
  },
  context,
) {
  const [showCancelled, setShowCancelled] = useState(false);
  const { config } = context;

  if (
    !error &&
    itineraries &&
    itineraries.length > 0 &&
    !itineraries.includes(undefined)
  ) {
    const summaries = itineraries.map((itinerary, i) => (
      <SummaryRow
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
        onlyHasWalkingItineraries={onlyHasWalkingItineraries}
        zones={
          config.zones.stops && itinerary.legs ? getZones(itinerary.legs) : []
        }
        delayThreshold={config.itinerary.delayThreshold}
      />
    ));
    if (
      context.match.params.hash &&
      context.match.params.hash === 'bikeAndVehicle'
    ) {
      if (bikeAndParkItinerariesToShow > 0) {
        summaries.splice(
          0,
          0,
          <ItinerarySummarySubtitle
            translationId="itinerary-summary.bikePark-title"
            defaultMessage="Biking \u0026 public transport \u0026 walking"
            key="itinerary-summary.bikePark-title"
          />,
        );
      }
      if (
        itineraries.length > bikeAndParkItinerariesToShow &&
        bikeAndPublicItinerariesToShow > 0
      ) {
        summaries.splice(
          bikeAndParkItinerariesToShow ? bikeAndParkItinerariesToShow + 1 : 0,
          0,
          <ItinerarySummarySubtitle
            translationId="itinerary-summary.bikeAndPublic-title"
            defaultMessage="Biking \u0026 public transport"
            key="itinerary-summary.bikeAndPublic-title"
          />,
        );
      }
      if (bikeRentAndPublicItinerariesToShow > 0) {
        // TODO if we'd start from the end, we don't need to check if other results are shown
        summaries.splice(
          bikeAndParkItinerariesToShow +
            bikeAndPublicItinerariesToShow +
            Math.min(1, bikeAndParkItinerariesToShow) +
            Math.min(1, bikeAndPublicItinerariesToShow),
          0,
          <ItinerarySummarySubtitle
            translationId="itinerary-summary.bikeRentAndPublic-title"
            defaultMessage="Bike rental \u0026 public transport"
            key="itinerary-summary.bikeRentAndPublic-title"
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

    if (loading) {
      return null;
    }

    const canceledItinerariesCount = itineraries.filter(itineraryHasCancelation)
      .length;
    return (
      <>
        <div className="summary-list-container" role="list">
          {showAlternativePlan && (
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
          {loadingMoreItineraries === 'top' && (
            <div className="summary-list-spinner-container">
              <Loading />
            </div>
          )}
          {isBrowser && (
            <div
              className={cx('summary-list-items', {
                'summary-list-items-loading-top':
                  loadingMoreItineraries === 'top',
              })}
            >
              {summaries}
            </div>
          )}
          {loadingMoreItineraries === 'bottom' && (
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
        {onlyHasWalkingItineraries && !showAlternativePlan && (
          <div className="summary-no-route-found" style={{ marginTop: 0 }}>
            <div
              className={cx('flex-horizontal', 'summary-notification', 'info')}
            >
              <Icon
                className={cx('no-route-icon', 'info')}
                img="icon-icon_info"
                color="#0074be"
              />
              <div>
                <div className="in-the-past">
                  <FormattedMessage
                    id="router-only-walk-title"
                    defaultMessage=""
                  />
                </div>
                <FormattedMessage
                  id="router-only-walk"
                  defaultMessage={
                    'Unfortunately no routes were found for your journey. ' +
                    'Please change your origin or destination address.'
                  }
                />
              </div>
            </div>{' '}
          </div>
        )}
      </>
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

  const hasSettingsChanges = !isEqual(
    getCurrentSettings(config),
    getDefaultSettings(config),
  );

  return (
    <ItinerarySummaryMessage
      areaPolygon={config.areaPolygon}
      biking={biking}
      driving={driving}
      error={error}
      from={from}
      locationState={locationState}
      routingErrors={routingErrors}
      minDistanceBetweenFromAndTo={config.minDistanceBetweenFromAndTo}
      nationalServiceLink={config.nationalServiceLink}
      searchTime={searchTime}
      currentTime={currentTime}
      to={to}
      walking={walking}
      hasSettingsChanges={hasSettingsChanges}
    />
  );
}

ItinerarySummaryListContainer.propTypes = {
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
  bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
  bikeRentAndPublicItinerariesToShow: PropTypes.number.isRequired,
  bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  driving: PropTypes.bool,
  showAlternativePlan: PropTypes.bool,
  separatorPosition: PropTypes.number,
  loadingMoreItineraries: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onlyHasWalkingItineraries: PropTypes.bool,
};

ItinerarySummaryListContainer.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
  walking: false,
  biking: false,
  driving: false,
  showAlternativePlan: false,
  separatorPosition: undefined,
  loadingMoreItineraries: undefined,
  routingErrors: [],
};

ItinerarySummaryListContainer.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
};

const containerComponent = createFragmentContainer(
  ItinerarySummaryListContainer,
  {
    itineraries: graphql`
      fragment ItinerarySummaryListContainer_itineraries on Itinerary
      @relay(plural: true) {
        walkDistance
        startTime
        endTime
        legs {
          # Temporarilly commented out, still needed in upstream OTP
          # alerts {
          #  alertId
          # }
          realTime
          departureDelay
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
              entities {
                __typename
                ... on Route {
                  patterns {
                    code
                  }
                }
              }
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
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
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
            bikeRentalStation {
              bikesAvailable
              networks
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
  },
);

export {
  containerComponent as default,
  ItinerarySummaryListContainer as Component,
};
