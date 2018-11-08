import startsWith from 'lodash/startsWith';
import inside from 'point-in-polygon';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import SummaryRow from './SummaryRow';
import { isBrowser } from '../util/browser';
import { getZones } from '../util/legUtils';

function ItinerarySummaryListContainer(
  {
    activeIndex,
    children,
    currentTime,
    error,
    from,
    intermediatePlaces,
    itineraries,
    onSelect,
    onSelectImmediately,
    open,
    searchTime,
    to,
  },
  { config },
) {
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
        zones={config.stopCard.header.showZone ? getZones(itinerary.legs) : []}
      >
        {i === openedIndex && children}
      </SummaryRow>
    ));

    return (
      <div className="summary-list-container">{isBrowser && summaries}</div>
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
  } else {
    msgId = 'no-route-msg';
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
        <Icon className="no-route-icon" img="icon-icon_caution" />
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
};

export default Relay.createContainer(ItinerarySummaryListContainer, {
  fragments: {
    itineraries: () => Relay.QL`
      fragment on Itinerary @relay(plural:true){
        walkDistance
        startTime
        endTime
        legs {
          realTime
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
            }
          }
          route {
            mode
            shortName
            color
            alerts {
              effectiveStartDate
              effectiveEndDate
            }
            agency {
              name
            }
          }
          trip {
            stoptimes {
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
            }
            bikeRentalStation {
              bikesAvailable
            }
          }
          to {
            stop {
              gtfsId
              zoneId
            }
          }
        }
      }
    `,
  },
});
