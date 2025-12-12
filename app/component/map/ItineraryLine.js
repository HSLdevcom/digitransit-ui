import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import Supercluster from 'supercluster';
import { withLeaflet } from 'react-leaflet';
import polyUtil from 'polyline-encoded';
import React from 'react';
import { getMiddleOf } from '../../util/geo-utils';
import { getInterliningLegs, getRouteText, LegMode } from '../../util/legUtils';
import { getRouteMode } from '../../util/modeUtils';
import { configShape, legShape } from '../../util/shapes';
import { durationToString } from '../../util/timeUtils';
import Line from './Line';
import StopMarker from './non-tile-layer/StopMarker';
import TransitLegMarkers from './non-tile-layer/TransitLegMarkers';
import VehicleMarker from './non-tile-layer/VehicleMarker';
import SpeechBubble from './SpeechBubble';
import EntranceMarker from './EntranceMarker';
import ClusterNumberMarker from './ClusterNumberMarker';
import IndoorRouteStepMarker from './IndoorRouteStepMarker';
import { createFeatureObjects } from '../../util/clusterUtils';
import {
  IndoorRouteStepType,
  IndoorRouteLegType,
  WheelchairBoarding,
} from '../../constants';
import {
  getEntranceObject,
  getEntranceWheelchairAccessibility,
  getIndoorRouteLegType,
  getIndoorStepsWithVerticalTransportationUse,
  isVerticalTransportationUse,
} from '../../util/indoorUtils';

class ItineraryLine extends React.Component {
  static contextTypes = {
    config: configShape.isRequired,
  };

  static propTypes = {
    legs: PropTypes.arrayOf(legShape).isRequired,
    passive: PropTypes.bool,
    hash: PropTypes.number,
    showIntermediateStops: PropTypes.bool,
    showDurationBubble: PropTypes.bool,
    streetMode: PropTypes.string,
    realtimeTransfers: PropTypes.bool,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    hash: 0,
    passive: false,
    streetMode: undefined,
    showIntermediateStops: false,
    showDurationBubble: false,
    realtimeTransfers: false,
  };

  state = {
    zoom: this.props.leaflet.map.getZoom(),
  };

  checkStreetMode(leg) {
    if (this.props.streetMode === 'walk') {
      return leg.mode === 'WALK';
    }
    if (this.props.streetMode === 'bike') {
      return leg.mode === 'BICYCLE';
    }
    return false;
  }

  handleEntrance(
    leg,
    nextLeg,
    mode,
    i,
    geometry,
    objs,
    clusterObjs,
    entranceObject,
    indoorRouteLegType,
  ) {
    const entranceCoordinates = [entranceObject.lat, entranceObject.lon];
    const getDistance = (coord1, coord2) => {
      const [lat1, lon1] = coord1;
      const [lat2, lon2] = coord2;
      return Math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2);
    };

    const entranceIndex = geometry.reduce(
      (closestIndex, currentCoord, currentIndex) => {
        const currentDistance = getDistance(entranceCoordinates, currentCoord);
        const closestDistance = getDistance(
          entranceCoordinates,
          geometry[closestIndex],
        );
        return currentDistance < closestDistance ? currentIndex : closestIndex;
      },
      0,
    );

    if (
      entranceCoordinates[0] &&
      entranceCoordinates[1] &&
      !this.props.passive
    ) {
      clusterObjs.push({
        lat: entranceCoordinates[0],
        lon: entranceCoordinates[1],
        properties: {
          iconCount:
            1 +
            (entranceObject.feature.publicCode ? 1 : 0) +
            (entranceObject.feature.wheelchairAccessible ===
            WheelchairBoarding.Possible
              ? 1
              : 0),
          type: IndoorRouteStepType.Entrance,
          code: entranceObject.feature.publicCode?.toLowerCase(),
        },
      });
    }

    objs.push(
      <Line
        color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
        key={`${this.props.hash}_${i}_${mode}_0`}
        geometry={geometry.slice(0, entranceIndex + 1)}
        mode={
          indoorRouteLegType === IndoorRouteLegType.StepsBeforeEntranceInside
            ? 'walk-inside'
            : 'walk'
        }
        passive={this.props.passive}
      />,
    );
    objs.push(
      <Line
        color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
        key={`${this.props.hash}_${i}_${mode}_1`}
        geometry={geometry.slice(entranceIndex)}
        mode={
          indoorRouteLegType === IndoorRouteLegType.StepsAfterEntranceInside
            ? 'walk-inside'
            : 'walk'
        }
        passive={this.props.passive}
      />,
    );
  }

  handleLine(previousLeg, leg, nextLeg, mode, i, geometry, objs, clusterObjs) {
    const entranceObject = getEntranceObject(previousLeg, leg);
    const indoorRouteLegType = getIndoorRouteLegType(previousLeg, leg, nextLeg);
    if (indoorRouteLegType !== IndoorRouteLegType.NoStepsInside) {
      this.handleEntrance(
        leg,
        nextLeg,
        mode,
        i,
        geometry,
        objs,
        clusterObjs,
        entranceObject,
        indoorRouteLegType,
      );
    } else {
      objs.push(
        <Line
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          key={`${this.props.hash}_${i}_${mode}`}
          geometry={geometry}
          mode={mode}
          passive={this.props.passive}
        />,
      );
    }
  }

  handleDurationBubble(leg, mode, i, objs, middle) {
    if (
      this.props.showDurationBubble ||
      (this.checkStreetMode(leg) && leg.distance > 100)
    ) {
      const duration = durationToString(leg.duration * 1000);
      objs.push(
        <SpeechBubble
          key={`speech_${this.props.hash}_${i}_${mode}`}
          position={middle}
          text={duration}
        />,
      );
    }
  }

  handleIntermediateStops(leg, mode, objs) {
    if (
      !this.props.passive &&
      this.props.showIntermediateStops &&
      leg.intermediatePlaces != null
    ) {
      leg.intermediatePlaces
        .filter(place => place.stop)
        .forEach(place =>
          objs.push(
            <StopMarker
              disableModeIcons
              limitZoom={14}
              stop={place.stop}
              key={`intermediate-${place.stop.gtfsId}`}
              mode={mode}
              thin
            />,
          ),
        );
    }
  }

  /**
   * Add dynamic transit leg and transfer stop markers.
   */
  handleTransitLegMarkers(transitLegs, objs) {
    if (!this.props.passive) {
      objs.push(
        <TransitLegMarkers
          key="transitlegmarkers"
          transitLegs={transitLegs}
          realtimeTransfers={this.props.realtimeTransfers}
        />,
      );
    }
  }

  handleIndoorRouteStepMarkers(previousLeg, leg, nextLeg, clusterObjs) {
    if (!this.props.passive) {
      const indoorRouteSteps = getIndoorStepsWithVerticalTransportationUse(
        previousLeg,
        leg,
        nextLeg,
      );

      if (indoorRouteSteps) {
        indoorRouteSteps.forEach((indoorRouteStep, i) => {
          if (indoorRouteStep.lat && indoorRouteStep.lon) {
            clusterObjs.push({
              lat: indoorRouteStep.lat,
              lon: indoorRouteStep.lon,
              properties: {
                iconCount: 1,
                // eslint-disable-next-line no-underscore-dangle
                type: indoorRouteStep.feature?.__typename,
                verticalDirection: indoorRouteStep.feature?.verticalDirection,
                index: i,
              },
            });
          }
        });
      }
    }
  }

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }

  onMapZoom = () => {
    const zoom = this.props.leaflet.map.getZoom();
    this.setState({ zoom });
  };

  handleClusterObjects(previousLeg, leg, nextLeg, objs, clusterObjs) {
    if (!this.props.passive) {
      const index = new Supercluster({
        radius: 60, // in pixels
        maxZoom: 15,
        minPoints: 2,
        extent: 512, // tile size (512)
        map: properties => ({
          iconCount: properties.iconCount,
        }),
        reduce: (accumulated, properties) => {
          // eslint-disable-next-line no-param-reassign
          accumulated.iconCount += properties.iconCount;
        },
      });

      index.load(createFeatureObjects(clusterObjs));
      const bbox = [-180, -85, 180, 85]; // Bounding box covers the entire world
      // TODO Fix to use smaller bbox, probably requires moveend event listening?
      // The same fix should also be applied to RentalVehicles where supercluster is also used.
      //
      //  const bounds = this.props.leaflet.map.getBounds();
      //  const bbox = [
      //    bounds.getWest(),
      //    bounds.getSouth(),
      //    bounds.getEast(),
      //    bounds.getNorth(),
      //  ];

      const clusters = index.getClusters(bbox, this.state.zoom);
      clusters.forEach(clusterFeature => {
        const { coordinates } = clusterFeature.geometry;
        const { properties } = clusterFeature;
        if (properties.cluster) {
          // Handle a cluster.
          objs.push(
            <ClusterNumberMarker
              key={`clusternumbermarker_${coordinates[0]}_${coordinates[1]}_clusterId_${properties.cluster_id}`}
              number={properties.iconCount}
              position={{
                lat: coordinates[0],
                lon: coordinates[1],
              }}
            />,
          );
        } else {
          // Handle a single point.
          // eslint-disable-next-line no-lonely-if
          if (properties.type === IndoorRouteStepType.Entrance) {
            objs.push(
              <EntranceMarker
                key={`entrance_${coordinates[0]}_${coordinates[1]}`}
                entranceAccessible={getEntranceWheelchairAccessibility(leg)}
                position={{
                  lat: coordinates[0],
                  lon: coordinates[1],
                }}
                code={properties.code}
              />,
            );
          } else if (isVerticalTransportationUse(properties.type)) {
            objs.push(
              <IndoorRouteStepMarker
                key={`indoorroutestepmarker_${coordinates[0]}_${coordinates[1]}`}
                position={{
                  lat: coordinates[0],
                  lon: coordinates[1],
                }}
                index={properties.index}
                indoorRouteSteps={getIndoorStepsWithVerticalTransportationUse(
                  previousLeg,
                  leg,
                  nextLeg,
                )}
              />,
            );
          }
        }
      });
    }
  }

  render() {
    const objs = [];
    const transitLegs = [];

    this.props.legs.forEach((leg, i) => {
      const clusterObjs = [];

      if (!leg || leg.mode === LegMode.Wait) {
        return;
      }
      const nextLeg = this.props.legs[i + 1];
      const previousLeg = this.props.legs[i - 1];

      let mode = getRouteMode(
        {
          mode: leg.mode,
          type: leg.route?.type,
          gtfsId: leg.route?.gtfsId,
        },
        this.context.config,
      );

      const [interliningLines, interliningLegs] = getInterliningLegs(
        this.props.legs,
        i,
      );

      const interliningWithRoute = interliningLines.join(' / ');

      if (leg.rentedBike && leg.mode !== 'WALK' && leg.mode !== 'SCOOTER') {
        mode = 'citybike';
      }

      const geometry = polyUtil.decode(leg.legGeometry.points);
      let middle = getMiddleOf(geometry);
      let { to, end } = leg;

      const rentalId =
        leg.from.vehicleRentalStation?.stationId ||
        leg.from.rentalVehicle?.vehicleId;
      const rentalNetwork =
        leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
        leg.from.rentalVehicle?.rentalNetwork.networkId;

      if (interliningLegs.length > 0) {
        // merge the geometries of legs where user can wait in the vehicle and find the middle point
        // of the new geometry
        const points = interliningLegs
          .map(iLeg => polyUtil.decode(iLeg.legGeometry.points))
          .flat();
        const interlinedGeometry = [...geometry, ...points];
        middle = getMiddleOf(interlinedGeometry);
        to = interliningLegs[interliningLegs.length - 1].to;
        end = interliningLegs[interliningLegs.length - 1].end;
      }

      this.handleLine(
        previousLeg,
        leg,
        nextLeg,
        mode,
        i,
        geometry,
        objs,
        clusterObjs,
      );
      this.handleDurationBubble(leg, mode, i, objs, middle);
      this.handleIntermediateStops(leg, mode, objs);
      this.handleIndoorRouteStepMarkers(previousLeg, leg, nextLeg, clusterObjs);
      this.handleClusterObjects(previousLeg, leg, nextLeg, objs, clusterObjs);

      if (!this.props.passive) {
        if (rentalId) {
          objs.push(
            <VehicleMarker
              key={`${leg.from.lat}:${leg.from.lon}`}
              showBikeAvailability={leg.mode === 'BICYCLE'}
              rental={{
                id: rentalId,
                lat: leg.from.lat,
                lon: leg.from.lon,
                network: rentalNetwork,
                vehiclesAvailable:
                  leg.from.vehicleRentalStation?.vehiclesAvailable,
              }}
              mode={leg.mode}
              transit
            />,
          );
        } else if (leg.transitLeg && mode !== 'taxi-external') {
          const name = getRouteText(
            leg.route,
            this.context.config,
            interliningWithRoute,
          );

          if (!leg?.interlineWithPreviousLeg) {
            transitLegs.push({
              ...leg,
              to,
              end,
              nextLeg,
              index: i,
              mode,
              legName: name,
              zIndexOffset: 300,
              interliningWithRoute,
            });
          }
          objs.push(
            <StopMarker
              key={`${i},${leg.mode}marker,from`}
              disableModeIcons
              disableIconBorder
              stop={{
                ...leg.from,
                gtfsId: leg.from.stop.gtfsId,
                code: leg.from.stop.code,
                platformCode: leg.from.stop.platformCode,
                transfer: true,
              }}
              mode={mode}
            />,
          );
          objs.push(
            <StopMarker
              key={`${i},${leg.mode}marker,to`}
              disableModeIcons
              disableIconBorder
              stop={{
                ...leg.to,
                gtfsId: leg.to.stop.gtfsId,
                code: leg.to.stop.code,
                platformCode: leg.to.stop.platformCode,
                transfer: true,
              }}
              mode={mode}
            />,
          );
        }
      }
    });

    this.handleTransitLegMarkers(transitLegs, objs);

    return <div style={{ display: 'none' }}>{objs}</div>;
  }
}

export default withLeaflet(ItineraryLine);
