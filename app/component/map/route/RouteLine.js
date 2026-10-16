import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import StopMarker from '../non-tile-layer/StopMarker';
import LocationMarker from '../LocationMarker';
import Line from '../Line';
import { getClosestPoint } from '../../../util/geo-utils';
import { getTripOrRouteMode } from '../../../util/modeUtils';
import { patternShape, tripShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getStopStatusFromStopData } from '../../../util/stopStatusUtils';

/**
 * Split the array points in two at the given position. Return index to split at
 */
function getSplitIndex(points, position) {
  // get closest point
  const distances = points.map(point => distance(point, position));
  const closestIndex = distances.indexOf(Math.min(...distances));

  // take 5 closest points on either side and calculate which point pair forms a line that has least distance to position
  const n = 5;
  let bestDistance = Infinity;
  let bestIndex = 0;
  for (let i = closestIndex - n; i <= closestIndex + n; i++) {
    if (i >= 0 && i + 1 < points.length) {
      const projectedToLine = getClosestPoint(
        points[i],
        points[i + 1],
        position,
      );
      const distanceToLine = distance(projectedToLine, position);
      if (distanceToLine < bestDistance) {
        bestDistance = distanceToLine;
        bestIndex = i;
      }
    }
  }
  // return the index immediately after
  return bestIndex + 1;
}

function RouteLine({
  pattern,
  trip = null,
  thin = false,
  filteredStops = [],
  vehiclePosition = null,
}) {
  const config = useConfigContext();

  if (!pattern) {
    return false;
  }

  const objs = [];
  const nowUnixTime = Date.now() / 1000;
  const modeClass = getTripOrRouteMode(trip, pattern.route, config);

  if (!thin) {
    // We are drawing a background line under an itinerary line,
    // so we don't want many markers cluttering the map
    objs.push(
      <LocationMarker key="from" position={pattern.stops[0]} type="from" />,
    );

    objs.push(
      <LocationMarker
        key="to"
        position={pattern.stops[pattern.stops.length - 1]}
        type="to"
      />,
    );
  }

  const filteredIds = filteredStops.map(stop => stop.stopId);

  if (!vehiclePosition) {
    const markers = pattern.stops
      .filter(stop => !filteredIds.includes(stop.gtfsId))
      .map((stop, i) => (
        <StopMarker
          stop={stop}
          key={`${stop.gtfsId}-${pattern.code}${
            i === pattern.stops.length - 1 && '-last'
          }`}
          mode={modeClass + (thin ? ' thin' : '')}
          thin={thin}
          stopStatus={getStopStatusFromStopData({
            stop,
            nowUnixTime,
            showStopStatusMarkers: config.showStopStatusMarkers,
          })}
        />
      ));

    return (
      <div style={{ display: 'none' }}>
        {objs}
        <Line
          key="line"
          color={pattern.route.color ? `#${pattern.route.color}` : null}
          geometry={pattern.geometry || pattern.stops}
          mode={modeClass}
          thin={thin}
        />
        {markers}
      </div>
    );
  }

  // if vehicle position is known, split into two lines: before and after vehicle
  const beforeSplitColor = '#888888';
  const stops = pattern.geometry || pattern.stops;
  const filteredPoints = stops.filter(
    point => point.lat !== null && point.lon !== null,
  );
  const lineSplitIndex = getSplitIndex(filteredPoints, vehiclePosition);

  const beforeSplit = filteredPoints.slice(0, lineSplitIndex);
  const afterSplit = filteredPoints.slice(lineSplitIndex);
  if (lineSplitIndex !== 0 && lineSplitIndex !== filteredPoints.length - 1) {
    // calculate new point at vehicle position that is first/last element of the two splits
    const lastBefore = beforeSplit[lineSplitIndex - 1];
    const firstAfter = afterSplit[0];
    const projectedPoint = getClosestPoint(
      lastBefore,
      firstAfter,
      vehiclePosition,
    );
    beforeSplit.push(projectedPoint);
    afterSplit.unshift(projectedPoint);
  }
  // split stops markers into two in the same way
  const markerSplitIndex = getSplitIndex(pattern.stops, vehiclePosition);
  const markers = pattern.stops
    .filter(stop => !filteredIds.includes(stop.gtfsId))
    .map((stop, i) => (
      <StopMarker
        stop={stop}
        key={`${stop.gtfsId}-${pattern.code}${
          i === pattern.stops.length - 1 && '-last'
        }`}
        mode={modeClass + (thin ? ' thin' : '')}
        colorOverride={i < markerSplitIndex ? beforeSplitColor : null}
        thin={thin}
        stopStatus={getStopStatusFromStopData({
          stop,
          nowUnixTime,
          showStopStatusMarkers: config.showStopStatusMarkers,
        })}
      />
    ));

  return (
    <div style={{ display: 'none' }}>
      {objs}
      <Line
        key="line_before"
        color={beforeSplitColor}
        geometry={beforeSplit}
        mode={modeClass}
        thin={thin}
      />
      <Line
        key="line_after"
        color={pattern.route.color ? `#${pattern.route.color}` : null}
        geometry={afterSplit}
        mode={modeClass}
        thin={thin}
      />
      {markers}
    </div>
  );
}

RouteLine.propTypes = {
  pattern: patternShape.isRequired,
  trip: tripShape,
  thin: PropTypes.bool,
  filteredStops: PropTypes.arrayOf(PropTypes.string.isRequired),
  vehiclePosition: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
};

export default createFragmentContainer(RouteLine, {
  pattern: graphql`
    fragment RouteLine_pattern on Pattern {
      code
      geometry {
        lat
        lon
      }
      route {
        mode
        type
        color
        gtfsId
      }
      stops {
        lat
        lon
        name
        gtfsId
        platformCode
        code
        alerts {
          alertEffect
          alertSeverityLevel
          effectiveStartDate
          effectiveEndDate
        }
        ...StopCardHeaderContainer_stop
      }
    }
  `,
});
