import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */

import Supercluster from 'supercluster';
import { useLeaflet } from 'react-leaflet/es/context';
import polyUtil from 'polyline-encoded';
import { useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { getMiddleOf } from '../../../shared/utils/geo-utils';
import {
  getInterliningLegs,
  getTripOrRouteText,
  LegMode,
  isLocalCallAgency,
  isTaxiLeg,
  isCallAgencyLeg,
} from '../../utils/legUtils';
import { getTripOrRouteMode } from '../../utils/modeUtils';
import { legShape } from '../../utils/shapes';
import { durationToString } from '../../utils/timeUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import Line from './Line';
import StopMarker from './non-tile-layer/StopMarker';
import TransitLegMarkers from './non-tile-layer/TransitLegMarkers';
import VehicleMarker from './non-tile-layer/VehicleMarker';
import SpeechBubble from './SpeechBubble';
import EntranceMarker from './EntranceMarker';
import RouteLineLabels from './route/RouteLineLabels';
import { getDetourSegments } from './route/skippedSegments';
import usePatternGeometries from './usePatternGeometries';
import {
  hasStoptimesForServiceDate,
  legKey,
  toCanceledStopIdSet,
  useCanceledStopIdsByLeg,
} from '../itinerary/useCanceledStopIds';
import { STOP_CALL_STATUS } from '../../utils/stopCallStatusUtils';
import ClusterNumberMarker from './ClusterNumberMarker';
import IndoorStepMarker from './IndoorStepMarker';
import { createFeatureObjects } from '../../utils/clusterUtils';
import { IndoorStepType, IndoorLegType, WheelchairBoarding } from '../../../shared/utils/constants';
import {
  getEntranceObject,
  getEntranceWheelchairAccessibility,
  getIndoorLegType,
  getIndoorStepsWithVerticalTransportation,
  isVerticalTransportationUse,
} from '../../utils/indoorUtils';

const NO_CANCELED_STOPS = {
  segments: null,
  points: [],
  labels: [],
  canceledIds: new Set(),
  extraStops: [],
};

/**
 * Canceled stop calls of a transit leg: the diverging line sections and the labels
 * for the first and last stop actually served, when those differ from the leg ends.
 */
function getLegCancelations(leg, geometry, canceledByLeg, patterns, intl, config) {
  const canceledStopIds = new Set(
    leg.trip?.gtfsId ? canceledByLeg.get(legKey(leg.trip.gtfsId, leg.serviceDate)) : [],
  );
  const callStops = leg.stopCalls?.map(sc => sc.stopLocation);
  if (
    !canceledStopIds.size ||
    !callStops?.length ||
    callStops.some(s => !s?.gtfsId || s.lat == null)
  ) {
    return NO_CANCELED_STOPS;
  }
  const pattern = patterns[leg.trip?.pattern?.code];
  // Canceled stops of the scheduled pattern right before or after the stop calls are not
  // stop calls of the leg, so they are taken from the pattern.
  const patternStops = pattern?.stops ?? [];
  // Stop calls are matched in order, so a loop pattern's repeated stop maps to the right index.
  let searchFrom = 0;
  const patternIndices = [];
  callStops.forEach(call => {
    const at = patternStops.findIndex((s, i) => i >= searchFrom && s.gtfsId === call.gtfsId);
    if (at >= 0) {
      patternIndices.push(at);
      searchFrom = at + 1;
    }
  });
  const firstAt = patternIndices.length ? patternIndices[0] : -1;
  const lastAt = patternIndices.length ? patternIndices[patternIndices.length - 1] : -1;
  const isCanceled = s => canceledStopIds.has(s.gtfsId);
  // only the canceled stops adjacent to the stop calls are needed
  let leadingFrom = firstAt;
  while (firstAt > 0 && leadingFrom > 0 && isCanceled(patternStops[leadingFrom - 1])) {
    leadingFrom -= 1;
  }
  const leading = firstAt > 0 ? patternStops.slice(leadingFrom, firstAt) : [];
  let trailingTo = lastAt + 1;
  while (lastAt >= 0 && trailingTo < patternStops.length && isCanceled(patternStops[trailingTo])) {
    trailingTo += 1;
  }
  const trailing = lastAt >= 0 ? patternStops.slice(lastAt + 1, trailingTo) : [];
  const stops = [...leading, ...callStops, ...trailing];
  const canceled = new Set();
  stops.forEach((stop, i) => {
    if (canceledStopIds.has(stop.gtfsId)) {
      canceled.add(i);
    }
  });
  if (!canceled.size) {
    return NO_CANCELED_STOPS;
  }
  // stoptimesForDate is for the current day; it tells the added stops only for that day.
  // Otherwise stops missing from the scheduled pattern are the added ones.
  const patternIds = new Set(patternStops.map(s => s.gtfsId));
  const addedIds = new Set(
    (hasStoptimesForServiceDate(leg, config.timeZone) ? leg.trip.stoptimesForDate : [])
      .filter(st => st.realtimeState === 'ADDED')
      .map(st => st.stop?.gtfsId),
  );
  const added = new Set();
  stops.forEach((stop, i) => {
    if (addedIds.has(stop.gtfsId) || (patternIds.size && !patternIds.has(stop.gtfsId))) {
      added.add(i);
    }
  });
  const segments = getDetourSegments(geometry, stops, canceled, added, pattern?.geometry, [
    leading.length,
    leading.length + callStops.length - 1,
  ]);
  const served = stops.filter((_, i) => !canceled.has(i));
  const labels = [];
  if (served.length) {
    const color = leg.route?.color ? `#${leg.route.color}` : config.colors.primary;
    if (served[0] !== stops[0]) {
      labels.push({
        key: 'from-label',
        position: served[0],
        text: intl.formatMessage({ id: 'route-start-stop' }),
        color,
        placement: 'right',
      });
    }
    if (served.at(-1) !== stops.at(-1)) {
      labels.push({
        key: 'to-label',
        position: served.at(-1),
        text: intl.formatMessage({ id: 'route-end-stop' }),
        color,
        placement: 'pin',
      });
    }
    segments
      .filter(segment => segment.detour)
      .forEach((segment, i) => {
        const [lat, lon] = segment.points[Math.floor(segment.points.length / 2)];
        labels.push({
          key: `detour-label-${i}`,
          position: { lat, lon },
          text: intl.formatMessage({ id: 'route-detour' }),
          color,
          placement: 'right',
        });
      });
    segments
      .filter(segment => segment.dashed)
      .forEach((segment, i) => {
        const [lat, lon] = segment.points[Math.floor(segment.points.length / 2)];
        labels.push({
          key: `canceled-label-${i}`,
          position: { lat, lon },
          text: intl.formatMessage({ id: 'route-canceled-section' }),
          color: config.map.line.canceledColor,
          placement: 'left',
        });
      });
  }
  return {
    segments,
    labels,
    canceledIds: new Set(stops.filter((_, i) => canceled.has(i)).map(s => s.gtfsId)),
    extraStops: [...leading, ...trailing],
  };
}

export default function ItineraryLine({
  legs,
  passive = false,
  hash = 0,
  showIntermediateStops = false,
  showDurationBubble = false,
  streetMode,
  realtimeTransfers = false,
}) {
  const leaflet = useLeaflet();
  const config = useConfigContext();
  const intl = useIntl();
  const [zoom, setZoom] = useState(() => leaflet.map.getZoom());
  const tripLegs = useMemo(() => legs.filter(leg => leg?.transitLeg), [legs]);
  const canceledByLeg = useCanceledStopIdsByLeg(tripLegs, !passive);
  const canceledStopIds = useMemo(() => toCanceledStopIdSet(canceledByLeg), [canceledByLeg]);
  const patterns = usePatternGeometries(
    canceledStopIds.size ? tripLegs.map(leg => leg.trip?.pattern?.code).filter(Boolean) : [],
  );

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

    const entranceIndex = geometry.reduce((closestIndex, currentCoord, currentIndex) => {
      const currentDistance = getDistance(entranceCoordinates, currentCoord);
      const closestDistance = getDistance(entranceCoordinates, geometry[closestIndex]);
      return currentDistance < closestDistance ? currentIndex : closestIndex;
    }, 0);

    if (entranceCoordinates[0] && entranceCoordinates[1] && !passive) {
      clusterObjs.push({
        lat: entranceCoordinates[0],
        lon: entranceCoordinates[1],
        properties: {
          iconCount:
            1 +
            (entranceObject.feature.publicCode ? 1 : 0) +
            (entranceObject.feature.wheelchairAccessible === WheelchairBoarding.Possible ? 1 : 0),
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
        mode={indoorLegType === IndoorLegType.StepsBeforeEntranceInside ? 'walk-inside' : 'walk'}
        passive={passive}
      />,
    );
    objs.push(
      <Line
        color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
        key={`${hash}_${i}_${mode}_1`}
        geometry={geometry.slice(entranceIndex)}
        mode={indoorLegType === IndoorLegType.StepsAfterEntranceInside ? 'walk-inside' : 'walk'}
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
    segments,
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
      (segments || [{ points: geometry, dashed: false }]).forEach((segment, j) =>
        objs.push(
          segment.dashed ? (
            <Line
              key={`${hash}_${i}_${mode}_${j}`}
              geometry={segment.points}
              mode={mode}
              passive={passive}
              appendClass={appendClass}
              dashed
            />
          ) : (
            <Line
              color={leg.route && leg.route.color ? `#${leg.route.color}` : null}
              key={`${hash}_${i}_${mode}_${j}`}
              geometry={segment.points}
              mode={mode}
              passive={passive}
              appendClass={appendClass}
            />
          ),
        ),
      );
    }
  }

  function handleDurationBubble(leg, mode, i, objs, middle) {
    if (showDurationBubble || (checkStreetMode(leg) && leg.distance > 100)) {
      const duration = durationToString(intl, leg.duration * 1000);
      objs.push(
        <SpeechBubble key={`speech_${hash}_${i}_${mode}`} position={middle} text={duration} />,
      );
    }
  }

  function handleIntermediateStops(leg, mode, objs, canceledIds) {
    if (!passive && leg.stopCalls != null) {
      leg.stopCalls
        .slice(1, -1)
        .filter(sc => sc.stopLocation)
        .filter(sc => showIntermediateStops || canceledIds.has(sc.stopLocation.gtfsId))
        .forEach(sc =>
          objs.push(
            <StopMarker
              disableModeIcons
              limitZoom={14}
              stop={sc.stopLocation}
              key={`intermediate-${sc.stopLocation.gtfsId}`}
              mode={mode}
              thin
              stopCallStatus={
                canceledIds.has(sc.stopLocation.gtfsId) ? STOP_CALL_STATUS.CANCELED : null
              }
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
      const indoorSteps = getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg);

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
        map: properties => ({ iconCount: properties.iconCount }),
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
              position={{ lat: coordinates[1], lon: coordinates[0] }}
            />,
          );
        } else {
          // Handle a single point.
          // eslint-disable-next-line no-lonely-if
          if (properties.type === IndoorStepType.Entrance) {
            objs.push(
              <EntranceMarker
                key={`entrance_${coordinates[1]}_${coordinates[0]}`}
                entranceAccessible={getEntranceWheelchairAccessibility(previousLeg, leg)}
                position={{ lat: coordinates[1], lon: coordinates[0] }}
                code={properties.code}
              />,
            );
          } else if (isVerticalTransportationUse(properties.type)) {
            objs.push(
              <IndoorStepMarker
                key={`indoorstepmarker_${coordinates[1]}_${coordinates[0]}`}
                position={{ lat: coordinates[1], lon: coordinates[0] }}
                index={properties.index}
                indoorSteps={getIndoorStepsWithVerticalTransportation(previousLeg, leg, nextLeg)}
              />,
            );
          }
        }
      });
    }
  }

  const objs = [];
  const transitLegs = [];
  // labels of all legs are placed together, clear of every line and of each other
  const labels = [];
  const labelLines = [];

  legs.forEach((leg, i) => {
    const clusterObjs = [];

    if (!leg || leg.mode === LegMode.Wait) {
      return;
    }
    const nextLeg = legs[i + 1];
    const previousLeg = legs[i - 1];

    let mode = getTripOrRouteMode(
      leg.trip,
      { mode: leg.mode, type: leg.route?.type, gtfsId: leg.route?.gtfsId },
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

    const rentalId = leg.from.vehicleRentalStation?.stationId || leg.from.rentalVehicle?.vehicleId;
    const rentalNetwork =
      leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
      leg.from.rentalVehicle?.rentalNetwork.networkId;

    const appendClass = isLocalCallAgency(leg, config) ? 'call-local' : '';

    if (interliningLegs.length > 0) {
      // merge the geometries of legs where user can wait in the vehicle and find the middle point
      // of the new geometry
      const points = interliningLegs.map(iLeg => polyUtil.decode(iLeg.legGeometry.points)).flat();
      const interlinedGeometry = [...geometry, ...points];
      middle = getMiddleOf(interlinedGeometry);
      to = interliningLegs[interliningLegs.length - 1].to;
      end = interliningLegs[interliningLegs.length - 1].end;
    }

    const cancelations = passive
      ? NO_CANCELED_STOPS
      : getLegCancelations(leg, geometry, canceledByLeg, patterns, intl, config);

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
      cancelations.segments,
    );
    if (!passive) {
      (cancelations.segments || [{ points: geometry }]).forEach(segment =>
        labelLines.push(segment.points.map(([lat, lon]) => ({ lat, lon }))),
      );
      cancelations.labels.forEach(label => labels.push({ ...label, key: `${i}-${label.key}` }));
    }
    handleDurationBubble(leg, mode, i, objs, middle);
    handleIntermediateStops(leg, mode, objs, cancelations.canceledIds);
    if (!passive) {
      cancelations.extraStops.forEach(stop =>
        objs.push(
          <StopMarker
            disableModeIcons
            limitZoom={14}
            stop={stop}
            key={`canceled-${stop.gtfsId}`}
            mode={mode}
            thin
            stopCallStatus={STOP_CALL_STATUS.CANCELED}
          />,
        ),
      );
    }
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
              availableVehicles: leg.from.vehicleRentalStation?.availableVehicles,
            }}
            mode={leg.mode}
            transit
          />,
        );
      } else if (leg.transitLeg && !isTaxiLeg(leg) && !isCallAgencyLeg(leg)) {
        // Call agency legs don't have stops, so they can't be rendered as clickable stop markers
        const name = getTripOrRouteText(leg.trip, leg.route, config, interliningWithRoute);

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
            stopCallStatus={
              cancelations.canceledIds.has(leg.from.stop.gtfsId) ? STOP_CALL_STATUS.CANCELED : null
            }
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
            stopCallStatus={
              cancelations.canceledIds.has(leg.to.stop.gtfsId) ? STOP_CALL_STATUS.CANCELED : null
            }
          />,
        );
      }
    }
  });

  handleTransitLegMarkers(transitLegs, objs);
  if (labels.length) {
    objs.push(<RouteLineLabels key="labels" labels={labels} linePoints={labelLines} />);
  }

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
};
