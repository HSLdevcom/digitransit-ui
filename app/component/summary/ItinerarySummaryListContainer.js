import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import SummaryRow from './SummaryRow';

function ItinerarySummaryListContainer(props) {
  const summaries = [];

  if (props.itineraries && props.itineraries.length > 0) {
    const open = props.open && Number(props.open);
    for (const [i, itinerary] of props.itineraries.entries()) {
      const passive = i !== props.activeIndex;

      summaries.push(
        <SummaryRow
          key={i}
          hash={i}
          data={itinerary}
          passive={passive}
          currentTime={props.currentTime}
          onSelect={props.onSelect}
        >
          {i === open && props.children}
        </SummaryRow>
      );
    }

    return <div className="summary-list-container">{summaries}</div>;
  }
  return (
    <div className="summary-list-container summary-no-route-found">
      <FormattedMessage
        id="no-route-msg"
        defaultMessage={'Unfortunately no route was found between the locations you gave. ' +
          'Please change origin and/or destination address.'}
      />
    </div>
  );
}

ItinerarySummaryListContainer.propTypes = {
  itineraries: React.PropTypes.array,
  activeIndex: React.PropTypes.number.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  open: React.PropTypes.number,
  children: React.PropTypes.node,
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
          route {
            shortName
          }
        }
      }
    `,
  },
});
