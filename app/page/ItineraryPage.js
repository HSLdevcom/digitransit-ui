import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';

import CityBikeMarker from '../component/map/non-tile-layer/CityBikeMarker';

import LocationMarker from '../component/map/LocationMarker';
import ItineraryLine from '../component/map/ItineraryLine';
import ItineraryTab from '../component/itinerary/ItineraryTab';
import Map from '../component/map/Map';
import Icon from '../component/icon/icon';

function ItineraryPage({ itinerary }) {
  return (
    <ItineraryTab
      focus={() => false}
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

ItineraryPageContainer.renderMap = (
  itinerary,
  { from, to, routes },
  { breakpoint, router, location }
) => {
  const leafletObjs = [
    <LocationMarker
      key="fromMarker"
      position={from}
      className="from"
    />,
    <LocationMarker
      key="toMarker"
      position={to}
      className="to"
    />];

  if (itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key={'line'}
        legs={itinerary.legs}
        showTransferLabels
        showIntermediateStops
      />
    );
  }
  const fullscreen = some(routes.map(route => route.fullscreenMap));

  const toggleFullscreenMap = fullscreen ?
    router.goBack :
    () => router.push({
      pathname: `${location.pathname}/kartta`,
    });

  const overlay = fullscreen ? undefined : (
    <div
      className="map-click-prevent-overlay"
      onClick={toggleFullscreenMap}
    />);

  return (
    <Map
      className="full"
      leafletObjs={leafletObjs}
      lat={from.lat}
      lon={from.lon}
      zoom={16}
      fitBounds={false}
      disableZoom={false}
    >
      {overlay}
      {breakpoint !== 'large' && (
        <div
          className="fullscreen-toggle"
          onClick={toggleFullscreenMap}
        >
          <Icon
            img="icon-icon_maximize"
            className="cursor-pointer"
          />
        </div>
      )}
    </Map>
  );
};

export default ItineraryPageContainer;
