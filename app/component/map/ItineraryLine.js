import React from 'react';
import Relay from 'react-relay';
import polyUtil from 'polyline-encoded';

import TripRoute from '../../route/TripRoute';
import StopMarker from './non-tile-layer/StopMarker';
import LegMarker from './non-tile-layer/LegMarker';
import LocationMarker from './LocationMarker';
import Line from './Line';
import TripLine from './TripLine';
import CityBikeMarker from './non-tile-layer/CityBikeMarker';

const isBrowser = typeof window !== 'undefined' && window !== null;

function getLengthOf(geometry) {
  let d = 0;

  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    d += Math.sqrt((dlat * dlat) + (dlon * dlon));
  }

  return d;
}

function getMiddleIndexOf(geometry) {
  let middleIndex = 0;
  let distanceSoFar = 0;
  const distanceToHalf = getLengthOf(geometry) * 0.5;

  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    distanceSoFar += Math.sqrt((dlat * dlat) + (dlon * dlon));
    if (distanceSoFar >= distanceToHalf) {
      middleIndex = i;
      break;
    }
  }
  return middleIndex;
}

function getMiddleOf(geometry) {
  if (geometry.length <= 0) return { lat: 0, lon: 0 };
  if (geometry.length === 1) return { lat: geometry[0][0], lon: geometry[0][1] };

  const i = Math.max(1, getMiddleIndexOf(geometry));

  return {
    lat: geometry[i - 1][0] + (0.5 * (geometry[i][0] - geometry[i - 1][0])),
    lon: geometry[i - 1][1] + (0.5 * (geometry[i][1] - geometry[i - 1][1])),
  };
}

class ItineraryLine extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
  };

  render() {
    let itineraryStops;

    if (!isBrowser) {
      return false;
    }

    const objs = [];

    if (this.props.showFromToMarkers) {
      objs.push(
        <LocationMarker
          key="from"
          position={this.props.legs[0].from}
          className="from"
        />);

      objs.push(<LocationMarker
        key="to"
        position={this.props.legs[this.props.legs.length - 1].to}
        className="to"
      />);
    }

    if (!this.props.passive) {
      itineraryStops = Array.prototype.concat.apply([], this.props.legs.map((leg) => {
        const fromTo = [leg.from, leg.to];

        if (leg.intermediateStops) {
          return leg.intermediateStops.concat(fromTo);
        }
        return fromTo;
      }));
    }

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
          key={`${this.props.hash}_${i}`}
          geometry={geometry}
          mode={mode.toLowerCase()}
          passive={this.props.passive}
        />);

      if (!this.props.passive) {
        if (leg.tripId) {
          objs.push(
            <Relay.RootContainer
              Component={TripLine}
              key={leg.tripId}
              route={new TripRoute({
                id: leg.tripId,
              })}
              renderLoading={() => false}
              renderFetched={data => <TripLine {...data} filteredStops={itineraryStops} />}
            />);
        }

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
  showFromToMarkers: React.PropTypes.bool,
  legs: React.PropTypes.array,
  passive: React.PropTypes.bool,
  hash: React.PropTypes.number,
  showTransferLabels: React.PropTypes.bool,
  showIntermediateStops: React.PropTypes.bool,
};

export default ItineraryLine;
