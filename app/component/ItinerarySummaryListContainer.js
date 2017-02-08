import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import SummaryRow from './SummaryRow';

function ItinerarySummaryListContainer(props) {
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

    return <div className="summary-list-container momentum-scroll">{summaries}</div>;
  }
  return (
    <div className="summary-list-container summary-no-route-found">
      <FormattedMessage
        id="no-route-msg"
        defaultMessage={'Unfortunately no routes were found for your journey. ' +
          'Please change your origin or destination address.'}
      />
    </div>
  );
}

ItinerarySummaryListContainer.propTypes = {
  searchTime: React.PropTypes.number.isRequired,
  itineraries: React.PropTypes.array,
  activeIndex: React.PropTypes.number.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  onSelectImmediately: React.PropTypes.func.isRequired,
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
            mode
            shortName
            agency {
              name
            }
          }
          from {
            name
          }
        }
      }
    `,
  },
});
