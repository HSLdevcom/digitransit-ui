import React from 'react';
import Relay from 'react-relay';
import queries from '../../queries';
const isBrowser = typeof window !== 'undefined' && window !== null;
import StopMarker from './non-tile-layer/stop-marker';
import LocationMarker from './location-marker';
import Line from './line';
import TripLine from './trip-line';
import polyUtil from 'polyline-encoded';
import CityBikeMarker from './non-tile-layer/city-bike-marker';

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
          map={this.props.map}
          layerContainer={this.props.layerContainer}
          key="from"
          position={this.props.legs[0].from}
          className="from"
        />);

      objs.push(<LocationMarker
        map={this.props.map}
        layerContainer={this.props.layerContainer}
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

      const modePlusClass = mode.toLowerCase() + (this.props.passive ? ' passive' : '');

      objs.push(
        <Line
          map={this.props.map}
          layerContainer={this.props.layerContainer}
          key={`${this.props.hash}_${i}`}
          geometry={polyUtil.decode(leg.legGeometry.points)}
          mode={mode.toLowerCase()}
          passive={this.props.passive}
        />);

      if (!this.props.passive) {
        if (leg.tripId) {
          objs.push(
            <Relay.RootContainer
              Component={TripLine}
              key={leg.tripId}
              route={new queries.TripRoute({
                id: leg.tripId,
              })}
              renderLoading={() => false}
              renderFetched={data =>
                (<TripLine
                  {...data}
                  map={this.props.map}
                  layerContainer={this.props.layerContainer}
                  filteredStops={itineraryStops}
                />)}
            />);
        }

        if (leg.intermediateStops != null) {
          leg.intermediateStops.forEach(stop =>
            objs.push(
              <StopMarker
                map={this.props.map}
                layerContainer={this.props.layerContainer}
                stop={{
                  lat: stop.lat,
                  lon: stop.lon,
                  name: stop.name,
                  gtfsId: stop.gtfsId,
                  code: stop.code,
                }}
                key={`intermediate-${stop.gtfsId}`}
                mode={modePlusClass}
                thin
              />)
            );
        }

        if (leg.from.vertexType === 'BIKESHARE') {
          objs.push(
            <CityBikeMarker
              map={this.props.map}
              layerContainer={this.props.layerContainer}
              key={leg.from.bikeRentalStation.stationId}
              station={{
                x: leg.from.lon,
                y: leg.from.lat,
                id: leg.from.bikeRentalStation.stationId,
              }}
            />);
        } else if (leg.from.vertexType === 'TRANSIT') {
          objs.push(
            <StopMarker
              map={this.props.map}
              layerContainer={this.props.layerContainer}
              key={`${i},${leg.mode}marker`}
              stop={{
                lat: leg.from.lat,
                lon: leg.from.lon,
                name: leg.from.name,
                gtfsId: leg.from.stop.gtfsId,
                code: leg.from.stop.code,
              }}
              mode={mode.toLowerCase()}
              renderText={leg.transitLeg && this.props.showTransferLabels}
            />);
        }
      }
    });

    return (<div style={{ display: 'none' }}>{objs}</div>);
  }
}

ItineraryLine.propTypes = {
  showFromToMarkers: React.PropTypes.bool,
  map: React.PropTypes.object,
  legs: React.PropTypes.array,
  layerContainer: React.PropTypes.object,
  passive: React.PropTypes.bool,
  hash: React.PropTypes.number,
  showTransferLabels: React.PropTypes.bool,
};

export default ItineraryLine;
