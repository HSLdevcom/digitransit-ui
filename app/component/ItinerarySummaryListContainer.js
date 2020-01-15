import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import cx from 'classnames';
import startsWith from 'lodash/startsWith';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import SummaryRow from './SummaryRow';
import { isBrowser } from '../util/browser';
import { distance } from '../util/geo-utils';
import { getZones } from '../util/legUtils';
import CanceledItineraryToggler from './CanceledItineraryToggler';
import { RouteAlertsQuery, StopAlertsQuery } from '../util/alertQueries';
import { itineraryHasCancelation } from '../util/alertUtils';
import { matchQuickOption } from '../util/planParamUtil';
import { getModes } from '../util/modeUtils';

function ItinerarySummaryListContainer(
  {
    activeIndex,
    children,
    currentTime,
    error,
    from,
    locationState,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    open,
    searchTime,
    to,
  },
  context,
) {
  const [showCancelled, setShowCancelled] = useState(false);
  const { config } = context;

  if (!error && itineraries && itineraries.length > 0) {
    const openedIndex = open && Number(open);
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
        zones={config.stopCard.header.showZone ? getZones(itinerary.legs) : []}
      >
        {i === openedIndex && children}
      </SummaryRow>
    ));

    const canceledItinerariesCount = itineraries.filter(itineraryHasCancelation)
      .length;
    return (
      <div className="summary-list-container" role="list">
        {isBrowser && summaries}
        {isBrowser &&
          canceledItinerariesCount > 0 && (
            <CanceledItineraryToggler
              showItineraries={showCancelled}
              toggleShowCanceled={() => setShowCancelled(!showCancelled)}
              canceledItinerariesAmount={canceledItinerariesCount}
            />
          )}
      </div>
    );
  }
  if (!error && (!from.lat || !from.lon || !to.lat || !to.lon)) {
    return (
      <div className="summary-list-container summary-no-route-found">
        <FormattedMessage
          id="no-route-start-end"
          defaultMessage="Please select origin and destination."
        />
      </div>
    );
  }

  let msgId;
  let outside;
  let iconType = 'caution';
  let iconImg = 'icon-icon_caution';
  // If error starts with "Error" it's not a message id, it's an error message
  // from OTP
  if (error && !startsWith(error, 'Error')) {
    msgId = error;
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
    } else {
      msgId = 'no-route-origin-near-destination';
    }
  } else {
    const quickOption = matchQuickOption(context);
    const currentModes = getModes(context.location, context.config);
    const modesDefault =
      Object.entries(context.config.transportModes).every(
        ([mode, modeConfig]) =>
          currentModes.includes(mode.toUpperCase()) === modeConfig.defaultValue,
      ) && currentModes.includes('PUBLIC_TRANSPORT');

    const hasChanges =
      quickOption === 'saved-settings' ||
      quickOption === 'custom-settings' ||
      !modesDefault;
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
          id="use-national-service"
          defaultMessage="You can also try the national service available at"
        />
        <ExternalLink
          className="external-no-route"
          {...config.nationalServiceLink}
        />
      </div>
    );
  }

  return (
    <div className="summary-list-container summary-no-route-found">
      <div className="flex-horizontal">
        <Icon className={cx('no-route-icon', iconType)} img={iconImg} />
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
  children: PropTypes.node,
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
  open: PropTypes.number,
  searchTime: PropTypes.number.isRequired,
  to: locationShape.isRequired,
};

ItinerarySummaryListContainer.defaultProps = {
  error: undefined,
  intermediatePlaces: [],
  itineraries: [],
};

ItinerarySummaryListContainer.contextTypes = {
  config: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

const containerComponent = Relay.createContainer(
  ItinerarySummaryListContainer,
  {
    fragments: {
      itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural:true){
        walkDistance
        startTime
        endTime
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
          intermediatePlace
          intermediatePlaces {
            stop {
              zoneId
              ${StopAlertsQuery}
            }
          }
          route {
            mode
            shortName
            color
            agency {
              name
            }
            ${RouteAlertsQuery}
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
              ${StopAlertsQuery}
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
              ${StopAlertsQuery}
            }
          }
        }
      }
    `,
    },
  },
);

export {
  containerComponent as default,
  ItinerarySummaryListContainer as Component,
};
