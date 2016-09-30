import React from 'react';
import Relay from 'react-relay';

import CityBikeMarker from '../component/map/non-tile-layer/CityBikeMarker';

import LocationMarker from '../component/map/LocationMarker';
import ItineraryLine from '../component/map/ItineraryLine';
import ItineraryTab from '../component/itinerary/ItineraryTab';
import Map from '../component/map/Map';

function ItineraryPage({ itinerary }) {
  return (
    <ItineraryTab
      focus={() => {}}
      itinerary={itinerary}
    />
  );
}

ItineraryPage.propTypes = {
  itinerary: React.PropTypes.object.isRequired,
};

const ItineraryPageContainer = Relay.createContainer(ItineraryPage, {
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

ItineraryPageContainer.renderMap = (itinerary) => {
  const leafletObjs = [
    <LocationMarker
      key="from"
      position={itinerary.legs[0].from}
      className="from"
    />,
    <LocationMarker
      key="to"
      position={itinerary.legs[itinerary.legs.length - 1].to}
      className="to"
    />,
    <ItineraryLine
      key={'line'}
      legs={itinerary.legs}
      showTransferLabels
      showIntermediateStops
    />];

  return (
    <Map
      className="full"
      leafletObjs={leafletObjs}
      lat={itinerary.legs[0].from.lat}
      lon={itinerary.legs[0].from.lon}
      zoom={16}
      fitBounds={false}
      disableZoom={false}
    />
  );
};

export default ItineraryPageContainer;
