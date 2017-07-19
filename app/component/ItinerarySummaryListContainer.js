import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import SummaryRow from './SummaryRow';

function ItinerarySummaryListContainer(props) {
  if (props.itineraries && props.itineraries.length > 0) {
    const open = props.open && Number(props.open);
    const summaries = props.itineraries.map((itinerary, i) =>
      <SummaryRow
        refTime={props.searchTime}
        key={i} // eslint-disable-line react/no-array-index-key
        hash={i}
        data={itinerary}
        passive={i !== props.activeIndex}
        currentTime={props.currentTime}
        onSelect={props.onSelect}
        onSelectImmediately={props.onSelectImmediately}
        intermediatePlaces={props.intermediatePlaces}
      >
        {i === open && props.children}
      </SummaryRow>,
    );

    return (
      <div className="summary-list-container momentum-scroll">
        {summaries}
      </div>
    );
  } else if (
    !props.from.lat ||
    !props.from.lon ||
    !props.to.lat ||
    !props.to.lon
  ) {
    return (
      <div className="summary-list-container summary-no-route-found">
        <FormattedMessage
          id="no-route-start-end"
          defaultMessage={'Please select origin and destination.'}
        />
      </div>
    );
  }
  return (
    <div className="summary-list-container summary-no-route-found">
      <FormattedMessage
        id="no-route-msg"
        defaultMessage={
          'Unfortunately no routes were found for your journey. ' +
          'Please change your origin or destination address.'
        }
      />
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
  intermediatePlaces: PropTypes.array,
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
