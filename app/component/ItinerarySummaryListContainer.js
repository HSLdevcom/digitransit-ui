import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import Icon from './Icon';

function ItinerarySummaryListContainer(props, context) {
  if (!props.error && props.itineraries && props.itineraries.length > 0) {
    const open = props.open && Number(props.open);
    const summaries = props.itineraries.map((itinerary, i) => (
      <SummaryRow
        refTime={props.searchTime}
        key={i} // eslint-disable-line react/no-array-index-key
        hash={i}
        data={itinerary}
        passive={i !== props.activeIndex}
        currentTime={props.currentTime}
        onSelect={props.onSelect}
        onSelectImmediately={props.onSelectImmediately}
        intermediatePlaces={props.relay.route.params.intermediatePlaces}
      >
        {i === open && props.children}
      </SummaryRow>
    ));

    return (
      <div className="summary-list-container momentum-scroll">{summaries}</div>
    );
  }
  const { from, to } = props.relay.route.params;
  if (!props.error && (!from.lat || !from.lon || !to.lat || !to.lon)) {
    return (
      <div className="summary-list-container summary-no-route-found">
        <FormattedMessage
          id="no-route-start-end"
          defaultMessage="Please select origin and destination."
        />
      </div>
    );
  }

  let msg;
  let outside;
  if (props.error) {
    msg = props.error;
  } else if (!inside([from.lon, from.lat], context.config.areaPolygon)) {
    msg = 'origin-outside-service';
    outside = true;
  } else if (!inside([to.lon, to.lat], context.config.areaPolygon)) {
    msg = 'destination-outside-service';
    outside = true;
  } else {
    msg = 'no-route-msg';
  }
  let linkPart = null;
  if (outside && context.config.nationalServiceLink) {
    linkPart = (
      <div>
        <FormattedMessage
          id="use-national-service"
          defaultMessage="You can also try the national service available at"
        />
        <ExternalLink
          className="external-no-route"
          {...context.config.nationalServiceLink}
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
            id={msg}
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

ItinerarySummaryListContainer.propTypes = {
  searchTime: PropTypes.number.isRequired,
  itineraries: PropTypes.array,
  activeIndex: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onSelectImmediately: PropTypes.func.isRequired,
  open: PropTypes.number,
  error: PropTypes.string,
  children: PropTypes.node,
  relay: PropTypes.shape({
    route: PropTypes.shape({
      params: PropTypes.shape({
        to: PropTypes.shape({
          lat: PropTypes.number,
          lon: PropTypes.number,
          address: PropTypes.string.isRequired,
        }).isRequired,
        from: PropTypes.shape({
          lat: PropTypes.number,
          lon: PropTypes.number,
          address: PropTypes.string.isRequired,
        }).isRequired,
        intermediatePlaces: PropTypes.array,
      }).isRequired,
    }).isRequired,
  }).isRequired,
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
            }
          }
          to {
            stop {
              gtfsId
            }
          }
        }
      }
    `,
  },
});
