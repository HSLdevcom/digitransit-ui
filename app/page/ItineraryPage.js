import React from 'react';
import Relay from 'react-relay';
import toClass from 'recompose/toClass';

import CityBikeMarker from '../component/map/non-tile-layer/CityBikeMarker';

import ItineraryTab from '../component/itinerary/ItineraryTab';

function ItineraryPage({ itinerary, focus }) {
  return (
    <ItineraryTab
      focus={focus}
      itinerary={itinerary}
      ref="itineraryTab"
    />
  );
}

ItineraryPage.propTypes = {
  itinerary: React.PropTypes.object.isRequired,
};

const ItineraryPageContainer = Relay.createContainer(toClass(ItineraryPage), {
  fragments: {
    itinerary: () => Relay.QL`
      fragment on Itinerary {
        walkDistance
        duration
        startTime
        endTime
        fares {
          type
          currency
          cents
        }
        legs {
          mode
          agency {
            name
          }
          from {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              ${CityBikeMarker.getFragment('station')}
            }
            stop {
              gtfsId
              code
              platformCode
            }
          }
          to {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              ${CityBikeMarker.getFragment('station')}
            }
            stop {
              gtfsId
              code
              platformCode
            }
          }
          legGeometry {
            length
            points
          }
          intermediateStops {
            gtfsId
            lat
            lon
            name
            code
            platformCode
          }
          realTime
          transitLeg
          rentedBike
          startTime
          endTime
          mode
          distance
          duration
          route {
            shortName
            gtfsId
          }
          trip {
            gtfsId
            tripHeadsign
            pattern {
              code
            }
          }
        }
      }
    `,
  },
});

export default ItineraryPageContainer;
