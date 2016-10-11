import React from 'react';
import Relay from 'react-relay';
import polyUtil from 'polyline-encoded';

import StopMarker from './non-tile-layer/StopMarker';
import LegMarker from './non-tile-layer/LegMarker';
import Line from './Line';
import CityBikeMarker from './non-tile-layer/CityBikeMarker';
import { getMiddleOf } from '../../util/geo-utils';

const isBrowser = typeof window !== 'undefined' && window !== null;

class ItineraryLine extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  render() {
    if (!isBrowser) { return false; }

    const objs = [];

    const usingOwnBicycle = (
      (this.props.legs[0] != null
        && this.props.legs[0].mode === 'BICYCLE')
      && !(this.props.legs[0].rentedBike)
    );

    this.props.legs.forEach((leg, i) => {
      if (leg.mode === 'WAIT') {
        return;
      }

      let { mode } = leg;

      if (leg.rentedBike) {
        mode = 'CITYBIKE';
      }

      if (usingOwnBicycle && leg.mode === 'WALK') {
        mode = 'BICYCLE_WALK';
      }

      const walking = leg.mode === 'WALK' || leg.mode === 'BICYCLE_WALK';

      const modePlusClass = mode.toLowerCase() + (this.props.passive ? ' passive' : '');

      const geometry = polyUtil.decode(leg.legGeometry.points);
      const middle = getMiddleOf(geometry);

      objs.push(
        <Line
          key={`${this.props.hash}_${i}_${mode}`}
          geometry={geometry}
          mode={mode.toLowerCase()}
          passive={this.props.passive}
        />);

      if (!this.props.passive) {
        if (this.props.showIntermediateStops && leg.intermediateStops != null) {
          leg.intermediateStops.forEach(stop =>
            objs.push(
              <StopMarker
                disableModeIcons
                stop={stop}
                key={`intermediate-${stop.gtfsId}`}
                mode={modePlusClass}
                thin
              />)
            );
        }

        if (leg.from.vertexType === 'BIKESHARE') {
          objs.push(
            <CityBikeMarker
              key={leg.from.bikeRentalStation.stationId}
              transit
              station={leg.from.bikeRentalStation}
            />);
        } else if (leg.from.vertexType === 'TRANSIT' && !walking) {
          if (leg.transitLeg) {
            let name = leg.route && leg.route.shortName;
            if (mode === 'SUBWAY' && !name) {
              name = 'M';
            }
            objs.push(
              <LegMarker
                key={`${i},${leg.mode}legmarker`}
                disableModeIcons
                renderName
                leg={{
                  from: leg.from,
                  to: leg.to,
                  lat: middle.lat,
                  lon: middle.lon,
                  name,
                  gtfsId: leg.from.stop.gtfsId,
                  code: leg.from.stop.code,
                }}
                mode={mode.toLowerCase()}
              />
            );
          }
          objs.push(
            <StopMarker
              key={`${i},${leg.mode}marker,from`}
              disableModeIcons
              stop={{
                ...leg.from,
                gtfsId: leg.from.stop.gtfsId,
                code: leg.from.stop.code,
                platformCode: leg.from.stop.platformCode,
                transfer: true,
              }}
              mode={mode.toLowerCase()}
              renderText={leg.transitLeg && this.props.showTransferLabels}
            />
          );
        }
      }
    });

    return (<div style={{ display: 'none' }}>{objs}</div>);
  }
}

ItineraryLine.propTypes = {
  legs: React.PropTypes.array,
  passive: React.PropTypes.bool,
  hash: React.PropTypes.number,
  showTransferLabels: React.PropTypes.bool,
  showIntermediateStops: React.PropTypes.bool,
};

export default Relay.createContainer(ItineraryLine, {
  fragments: {
    legs: () => Relay.QL`
      fragment on Leg @relay(plural: true){
        mode
        legGeometry {
          points
        }
        transitLeg
        route {
          shortName
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
        intermediateStops {
          gtfsId
          lat
          lon
          name
          code
          platformCode
        }
      }
    `,
  },
});
