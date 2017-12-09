import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import { FormattedMessage } from 'react-intl';
import inside from 'point-in-polygon';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';

function ItinerarySummaryListContainer(props, context) {
  if (props.itineraries && props.itineraries.length > 0) {
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
      >
        {i === open && props.children}
      </SummaryRow>
    ));

    return (
      <div className="summary-list-container momentum-scroll">{summaries}</div>
    );
  }

  const from = otpToLocation(props.params.from);
  const to = otpToLocation(props.params.to);
  if (!from.lat || !from.lon || !to.lat || !to.lon) {
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
  if (!inside([from.lon, from.lat], context.config.areaPolygon)) {
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
  children: PropTypes.node,
  params: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
};

ItinerarySummaryListContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default createFragmentContainer(ItinerarySummaryListContainer, {
  itineraries: graphql`
    fragment ItinerarySummaryListContainer_itineraries on Itinerary
      @relay(plural: true) {
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
});
