import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import cx from 'classnames';
import startsWith from 'lodash/startsWith';
import { matchShape } from 'found';
import isEqual from 'lodash/isEqual';

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import Icon from './Icon';
import SummaryRow from './SummaryRow';
import { isBrowser } from '../util/browser';
import { getZones } from '../util/legUtils';
import CanceledItineraryToggler from './CanceledItineraryToggler';
import { itineraryHasCancelation } from '../util/alertUtils';
import { getCurrentSettings, getDefaultSettings } from '../util/planParamUtil';
import { ItinerarySummarySubtitle } from './ItinerarySummarySubtitle';
import Loading from './Loading';

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
    bikeAndParkItinerariesToShow,
    parkAndRide,
    car,
    onDemandTaxi,
    walking,
    biking,
    showAlternativePlan,
    separatorPosition,
    loadingMoreItineraries,
    loading,
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
        const bikeAndPublicItineraries = itineraries.slice(
          bikeAndParkItinerariesToShow,
        );
        const filteredBikeAndPublicItineraries = bikeAndPublicItineraries.map(
          i =>
            i.legs.filter(obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE'),
        );
        const allModes = Array.from(
          new Set(
            filteredBikeAndPublicItineraries.length > 0
              ? filteredBikeAndPublicItineraries.map(p =>
                  p[0].mode.toLowerCase(),
                )
              : [],
          ),
        );
        summaries.splice(
          bikeAndParkItinerariesToShow ? bikeAndParkItinerariesToShow + 1 : 0,
          0,
          <ItinerarySummarySubtitle
            translationId={`itinerary-summary.bikeAndPublic-${allModes
              .sort()
              .join('-')}-title`}
            defaultMessage="Biking \u0026 public transport"
            key="itinerary-summary.bikeAndPublic-title"
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

    const canceledItinerariesCount = itineraries.filter(itineraryHasCancelation)
      .length;
    return (
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

  if (loading) {
    return null;
  }

  let msgId;
  let outside;
  let iconType = 'caution';
  let iconImg = 'icon-icon_caution';
  // If error starts with "Error" it's not a message id, it's an error message
  // from OTP
  if (error && !startsWith(error, 'Error')) {
    msgId = 'no-route-msg';
  } else if (!inside([from.lon, from.lat], config.areaPolygon)) {
    msgId = 'origin-outside-service';
    outside = true;
  } else if (!inside([to.lon, to.lat], config.areaPolygon)) {
    msgId = 'destination-outside-service';
    outside = true;
  } else if (distance(from, to) < config.minDistanceBetweenFromAndTo) {
    iconType = 'info';
    iconImg = 'icon-icon_info';
    if (
      locationState &&
      locationState.hasLocation &&
      ((from.lat === locationState.lat && from.lon === locationState.lon) ||
        (to.lat === locationState.lat && to.lon === locationState.lon))
    ) {
      msgId = 'no-route-already-at-destination';
    } else if (to && from && from.lat === to.lat && from.lon === to.lon) {
      msgId = 'no-route-origin-same-as-destination';
    } else {
      msgId = 'no-route-origin-near-destination';
    }
  } else if (parkAndRide || car) {
    iconType = 'info';
    iconImg = 'icon-icon_info';
    msgId = 'car-park-ride-itinerary';
  } else if (onDemandTaxi) {
    iconType = 'info';
    iconImg = 'icon-icon_info';
    msgId = 'on-demand-taxi-itinerary';
  } else if (walking || biking) {
    iconType = 'info';
    iconImg = 'icon-icon_info';
    if (walking && !biking) {
      msgId = 'walk-bike-itinerary-1';
    } else if (!walking && biking) {
      msgId = 'walk-bike-itinerary-2';
    } else {
      msgId = 'walk-bike-itinerary-3';
    }
  } else {
    const hasChanges = !isEqual(
      getCurrentSettings(config),
      getDefaultSettings(config),
    );
    if (hasChanges) {
      msgId = 'no-route-msg-with-changes';
    } else {
      msgId = 'no-route-msg';
    }
  }

  let linkPart = null;
  if (outside && config.nationalServiceLink) {
    linkPart = (
      <div>
        <FormattedMessage
          id="use-national-service-prefix"
          defaultMessage="You can also try the national service available at"
        />
        <a className="no-decoration" href={config.nationalServiceLink.href}>
          {config.nationalServiceLink.name}
        </a>
        <FormattedMessage id="use-national-service-postfix" defaultMessage="" />
      </div>
    );
  }
  const background = iconImg.replace('icon-icon_', '');
  return (
    <div className="summary-list-container summary-no-route-found">
      <div
        className={cx('flex-horizontal', 'summary-notification', background)}
      >
        <Icon
          className={cx('no-route-icon', iconType)}
          img={iconImg}
          color={iconImg === 'icon-icon_info' ? '#007ac9' : null}
        />
        <div>
          <FormattedMessage
            id={msgId}
            defaultMessage={
              'Unfortunately no routes were found for your journey. ' +
              'Please change your origin or destination address.'
            }
          />
          {linkPart}
        </div>
      </div>
    </div>
  );
}

const locationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

ItinerarySummaryListContainer.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ message: PropTypes.string }),
  ]),
  from: locationShape.isRequired,
  intermediatePlaces: PropTypes.arrayOf(locationShape),
  itineraries: PropTypes.array,
  locationState: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  searchTime: PropTypes.number.isRequired,
  to: locationShape.isRequired,
  bikeAndPublicItinerariesToShow: PropTypes.number.isRequired,
  bikeAndParkItinerariesToShow: PropTypes.number.isRequired,
  parkAndRide: PropTypes.bool,
  car: PropTypes.bool,
  onDemandTaxi: PropTypes.bool,
  walking: PropTypes.bool,
  biking: PropTypes.bool,
  showAlternativePlan: PropTypes.bool,
  separatorPosition: PropTypes.number,
  loadingMoreItineraries: PropTypes.string,
  loading: PropTypes.bool.isRequired,
};

ItinerarySummaryListContainer.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
  walking: false,
  biking: false,
  showAlternativePlan: false,
  separatorPosition: undefined,
  loadingMoreItineraries: undefined,
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
          alerts {
            alertId
          }
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
            color
            agency {
              name
            }
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              trip {
                pattern {
                  code
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
