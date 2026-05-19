import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import Supercluster from 'supercluster';
import { withLeaflet } from 'react-leaflet';
import polyUtil from 'polyline-encoded';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { getMiddleOf } from '../../util/geo-utils';
import {
  getInterliningLegs,
  getTripOrRouteText,
  LegMode,
  isLocalCallAgency,
} from '../../util/legUtils';
import { getTripOrRouteMode } from '../../util/modeUtils';
import { legShape } from '../../util/shapes';
import { durationToString } from '../../util/timeUtils';
import { useConfigContext } from '../../configurations/ConfigContext';
import Line from './Line';
import StopMarker from './non-tile-layer/StopMarker';
import TransitLegMarkers from './non-tile-layer/TransitLegMarkers';
import VehicleMarker from './non-tile-layer/VehicleMarker';
import SpeechBubble from './SpeechBubble';
import EntranceMarker from './EntranceMarker';
import ClusterNumberMarker from './ClusterNumberMarker';
import IndoorStepMarker from './IndoorStepMarker';
import { createFeatureObjects } from '../../util/clusterUtils';
import {
  IndoorStepType,
  IndoorLegType,
  WheelchairBoarding,
} from '../../constants';
import {
  getEntranceObject,
  getEntranceWheelchairAccessibility,
  getIndoorLegType,
  getIndoorStepsWithVerticalTransportation,
  isVerticalTransportationUse,
} from '../../util/indoorUtils';

function ItineraryLine({
  legs,
  passive,
  hash,
  showIntermediateStops,
  showDurationBubble,
  streetMode,
  realtimeTransfers,
  leaflet,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const [zoom, setZoom] = useState(() => leaflet.map.getZoom());

  // TODO when we upgrade to react-leaflet v3 and react v17, this should be changed.
  useEffect(() => {
    const onMapZoom = () => setZoom(leaflet.map.getZoom());
    leaflet.map.on('zoomend', onMapZoom);
    return () => leaflet.map.off('zoomend', onMapZoom);
  }, [leaflet.map]);

  function checkStreetMode(leg) {
    if (streetMode === 'walk') {
      return leg.mode === 'WALK';
    }
    if (streetMode === 'bike') {
      return leg.mode === 'BICYCLE';
    }
    return false;
  }

  function handleEntrance(
    leg,
    nextLeg,
    mode,
    i,
    geometry,
    objs,
    clusterObjs,
    entranceObject,
    indoorLegType,
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

    if (entranceCoordinates[0] && entranceCoordinates[1] && !passive) {
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
          type: IndoorStepType.Entrance,
          code: entranceObject.feature.publicCode?.toLowerCase(),
        },
      });
    }

    objs.push(
      <Line
        color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
        key={`${hash}_${i}_${mode}_0`}
        geometry={geometry.slice(0, entranceIndex + 1)}
        mode={
          indoorLegType === IndoorLegType.StepsBeforeEntranceInside
            ? 'walk-inside'
            : 'walk'
        }
        passive={passive}
      />,
    );
    objs.push(
      <Line
        color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
        key={`${hash}_${i}_${mode}_1`}
        geometry={geometry.slice(entranceIndex)}
        mode={
          indoorLegType === IndoorLegType.StepsAfterEntranceInside
            ? 'walk-inside'
            : 'walk'
        }
        passive={passive}
      />,
    );
  }

  function handleLine(
    previousLeg,
    leg,
    nextLeg,
    mode,
    i,
    geometry,
    objs,
    clusterObjs,
    appendClass,
  ) {
    const entranceObject = getEntranceObject(previousLeg, leg);
    const indoorLegType = getIndoorLegType(previousLeg, leg, nextLeg);
    if (indoorLegType !== IndoorLegType.NoStepsInside) {
      handleEntrance(
        leg,
        nextLeg,
        mode,
        i,
        geometry,
        objs,
        clusterObjs,
        entranceObject,
        indoorLegType,
      );
    } else {
      objs.push(
        <Line
          color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
          key={`${hash}_${i}_${mode}`}
          geometry={geometry}
          mode={mode}
          passive={passive}
          appendClass={appendClass}
        />,
      );
    }
  }

  function handleDurationBubble(leg, mode, i, objs, middle) {
    if (showDurationBubble || (checkStreetMode(leg) && leg.distance > 100)) {
      const duration = durationToString(intl, leg.duration * 1000);
      objs.push(
        <SpeechBubble
          key={`speech_${hash}_${i}_${mode}`}
          position={middle}
          text={duration}
        />,
      );
    }
  }

  function handleIntermediateStops(leg, mode, objs) {
    if (!passive && showIntermediateStops && leg.intermediatePlaces != null) {
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

  /** Add dynamic transit leg and transfer stop markers. */
  function handleTransitLegMarkers(transitLegs, objs) {
    if (!passive) {
      objs.push(
        <TransitLegMarkers
          key="transitlegmarkers"
          transitLegs={transitLegs}
          realtimeTransfers={realtimeTransfers}
        />,
      );
    }
  }

  function handleIndoorStepMarkers(previousLeg, leg, nextLeg, clusterObjs) {
    if (!passive) {
      const indoorSteps = getIndoorStepsWithVerticalTransportation(
        previousLeg,
        leg,
        nextLeg,
      );

      if (indoorSteps) {
        indoorSteps.forEach((indoorStep, i) => {
          if (indoorStep.lat && indoorStep.lon) {
            clusterObjs.push({
              lat: indoorStep.lat,
              lon: indoorStep.lon,
              properties: {
                iconCount: 1,
                // eslint-disable-next-line no-underscore-dangle
                type: indoorStep.feature?.__typename,
                verticalDirection: indoorStep.feature?.verticalDirection,
                index: i,
              },
            });
          }
        });
      }
    }
  }

  function handleClusterObjects(previousLeg, leg, nextLeg, objs, clusterObjs) {
    // Only display any objects at all if the zoom is above 13.
    if (!passive && zoom > 13) {
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
      const clusters = index.getClusters(bbox, zoom);
      clusters.forEach(clusterFeature => {
        // Confusingly geojson format uses [lon, lat] instead of [lat, lon] used elsewhere in this file.
        const { coordinates } = clusterFeature.geometry;
        const { properties } = clusterFeature;
        if (properties.cluster) {
          // Handle a cluster.
          objs.push(
            <ClusterNumberMarker
              key={`clusternumbermarker_${coordinates[1]}_${coordinates[0]}_clusterId_${properties.cluster_id}`}
              number={properties.iconCount}
              position={{
                lat: coordinates[1],
                lon: coordinates[0],
              }}
            />,
          );
        } else {
          // Handle a single point.
          // eslint-disable-next-line no-lonely-if
          if (properties.type === IndoorStepType.Entrance) {
            objs.push(
              <EntranceMarker
                key={`entrance_${coordinates[1]}_${coordinates[0]}`}
                entranceAccessible={getEntranceWheelchairAccessibility(
                  previousLeg,
                  leg,
                )}
                position={{
                  lat: coordinates[1],
                  lon: coordinates[0],
                }}
                code={properties.code}
              />,
            );
          } else if (isVerticalTransportationUse(properties.type)) {
            objs.push(
              <IndoorStepMarker
                key={`indoorstepmarker_${coordinates[1]}_${coordinates[0]}`}
                position={{
                  lat: coordinates[1],
                  lon: coordinates[0],
                }}
                index={properties.index}
                indoorSteps={getIndoorStepsWithVerticalTransportation(
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

  const objs = [];
  const transitLegs = [];

  legs.forEach((leg, i) => {
    const clusterObjs = [];

    if (!leg || leg.mode === LegMode.Wait) {
      return;
    }
    const nextLeg = legs[i + 1];
    const previousLeg = legs[i - 1];

    let mode = getTripOrRouteMode(
      leg.trip,
      {
        mode: leg.mode,
        type: leg.route?.type,
        gtfsId: leg.route?.gtfsId,
      },
      config,
    );

    const [interliningLines, interliningLegs] = getInterliningLegs(legs, i);

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

    const appendClass = isLocalCallAgency(leg, config) ? 'call-local' : '';

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

    handleLine(
      previousLeg,
      leg,
      nextLeg,
      mode,
      i,
      geometry,
      objs,
      clusterObjs,
      appendClass,
    );
    handleDurationBubble(leg, mode, i, objs, middle);
    handleIntermediateStops(leg, mode, objs);
    handleIndoorStepMarkers(previousLeg, leg, nextLeg, clusterObjs);
    handleClusterObjects(previousLeg, leg, nextLeg, objs, clusterObjs);

    if (!passive) {
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
        const name = getTripOrRouteText(
          leg.trip,
          leg.route,
          config,
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
            appendClass={appendClass}
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
            appendClass={appendClass}
          />,
        );
      }
    }
  });

  handleTransitLegMarkers(transitLegs, objs);

  return <div style={{ display: 'none' }}>{objs}</div>;
}

ItineraryLine.propTypes = {
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

ItineraryLine.defaultProps = {
  hash: 0,
  passive: false,
  streetMode: undefined,
  showIntermediateStops: false,
  showDurationBubble: false,
  realtimeTransfers: false,
};

export default withLeaflet(ItineraryLine);
