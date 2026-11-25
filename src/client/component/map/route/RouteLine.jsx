import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { graphql, useFragment } from 'react-relay';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import StopMarker from '../non-tile-layer/StopMarker';
import LocationMarker from '../LocationMarker';
import Line from '../Line';
import groupSkippedStops from '../../routepage/groupSkippedStops';
import { getSkippedRanges, splitByRanges } from './skippedSegments';
import { getClosestPoint } from '../../../../shared/utils/geo-utils';
import { getTripOrRouteMode } from '../../../utils/modeUtils';
import { fragmentRefShape, tripShape } from '../../../utils/shapes';
import { useConfigContext } from '../../../hooks/ConfigContext';
import { STOP_CALL_STATUS } from '../../../utils/stopCallStatusUtils';
import { getStopStatusFromStopData } from '../../../utils/stopStatusUtils';

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
      const projectedToLine = getClosestPoint(points[i], points[i + 1], position);
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

const EMPTY_FILTERED_STOPS = [];
const EMPTY_STOPTIMES = [];

/**
 * Indices of the scheduled stops that the trip does not serve
 */
function getCanceledStopIndices(stops, stoptimes) {
  const indices = new Set();
  if (stoptimes.length) {
    groupSkippedStops(stoptimes, stops).forEach(item => {
      if (item.skipped) {
        item.skippedIndices.forEach(i => indices.add(i));
      } else if (item.stoptime?.realtimeState === 'CANCELED' && item.scheduledIndex >= 0) {
        indices.add(item.scheduledIndex);
      }
    });
  }
  return indices;
}

const RouteLineFragment = graphql`
  fragment RouteLineFragment on Pattern {
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
      ...StopCardHeader_stop
    }
  }
`;

export default function RouteLine({
  pattern: patternRef,
  trip = null,
  thin = false,
  filteredStops = EMPTY_FILTERED_STOPS,
  vehiclePosition = null,
  stoptimes = EMPTY_STOPTIMES,
}) {
  const config = useConfigContext();
  const pattern = useFragment(RouteLineFragment, patternRef);
  const patternPoints = pattern?.geometry || pattern?.stops;
  const patternStops = pattern?.stops;
  const { allPoints, canceledStops, skippedRanges } = useMemo(() => {
    if (!patternPoints || !patternStops) {
      return { allPoints: [], canceledStops: new Set(), skippedRanges: [] };
    }
    const points = patternPoints.filter(point => point.lat !== null && point.lon !== null);
    const ids = getCanceledStopIndices(patternStops, stoptimes);
    return {
      allPoints: points,
      canceledStops: new Set(patternStops.filter((_, i) => ids.has(i))),
      skippedRanges: getSkippedRanges(points, patternStops, ids),
    };
  }, [patternPoints, patternStops, stoptimes]);

  if (!pattern) {
    return false;
  }

  const objs = [];
  const nowUnixTime = Date.now() / 1000;
  const modeClass = getTripOrRouteMode(trip, pattern.route, config);

  if (!thin) {
    // We are drawing a background line under an itinerary line,
    // so we don't want many markers cluttering the map
    objs.push(<LocationMarker key="from" position={pattern.stops[0]} type="from" />);

    objs.push(
      <LocationMarker key="to" position={pattern.stops[pattern.stops.length - 1]} type="to" />,
    );
  }

  const filteredIds = filteredStops.map(stop => stop.stopId);

  const getStopStatus = stop =>
    getStopStatusFromStopData({
      stop,
      nowUnixTime,
      showStopStatusMarkers: config.showStopStatusMarkers,
    });
  const getStopCallStatus = stop => (canceledStops.has(stop) ? STOP_CALL_STATUS.CANCELED : null);
  const lineColor = pattern.route.color ? `#${pattern.route.color}` : null;
  const renderLines = (points, color, keyPrefix, offset) =>
    splitByRanges(points, skippedRanges, offset).map((segment, i) =>
      segment.dashed ? (
        <Line
          // eslint-disable-next-line react/no-array-index-key
          key={`${keyPrefix}-${i}`}
          geometry={segment.points}
          mode={modeClass}
          thin={thin}
          dashed
        />
      ) : (
        <Line
          // eslint-disable-next-line react/no-array-index-key
          key={`${keyPrefix}-${i}`}
          color={color}
          geometry={segment.points}
          mode={modeClass}
          thin={thin}
        />
      ),
    );

  if (!vehiclePosition) {
    const markers = pattern.stops
      .filter(stop => !filteredIds.includes(stop.gtfsId))
      .map((stop, i) => (
        <StopMarker
          stop={stop}
          key={`${stop.gtfsId}-${pattern.code}${i === pattern.stops.length - 1 && '-last'}`}
          mode={modeClass + (thin ? ' thin' : '')}
          thin={thin}
          stopStatus={getStopStatus(stop)}
          stopCallStatus={getStopCallStatus(stop)}
        />
      ));

    return (
      <div style={{ display: 'none' }}>
        {objs}
        {renderLines(allPoints, lineColor, 'line', 0)}
        {markers}
      </div>
    );
  }

  // if vehicle position is known, split into two lines: before and after vehicle
  const beforeSplitColor = '#888888';
  const filteredPoints = allPoints;
  const lineSplitIndex = getSplitIndex(filteredPoints, vehiclePosition);

  const beforeSplit = filteredPoints.slice(0, lineSplitIndex);
  const afterSplit = filteredPoints.slice(lineSplitIndex);
  let afterOffset = lineSplitIndex;
  if (lineSplitIndex !== 0 && lineSplitIndex !== filteredPoints.length - 1) {
    // the projected point is first in afterSplit, between geometry points L - 1 and L
    afterOffset = lineSplitIndex - 1;
    // calculate new point at vehicle position that is first/last element of the two splits
    const lastBefore = beforeSplit[lineSplitIndex - 1];
    const firstAfter = afterSplit[0];
    const projectedPoint = getClosestPoint(lastBefore, firstAfter, vehiclePosition);
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
        key={`${stop.gtfsId}-${pattern.code}${i === pattern.stops.length - 1 && '-last'}`}
        mode={modeClass + (thin ? ' thin' : '')}
        colorOverride={i < markerSplitIndex ? beforeSplitColor : null}
        thin={thin}
        stopStatus={getStopStatus(stop)}
      />
    ));

  return (
    <div style={{ display: 'none' }}>
      {objs}
      {renderLines(beforeSplit, beforeSplitColor, 'line_before', 0)}
      {renderLines(afterSplit, lineColor, 'line_after', afterOffset)}
      {markers}
    </div>
  );
}

RouteLine.propTypes = {
  pattern: fragmentRefShape.isRequired,
  trip: tripShape,
  thin: PropTypes.bool,
  filteredStops: PropTypes.arrayOf(PropTypes.string.isRequired),
  vehiclePosition: PropTypes.shape({ lat: PropTypes.number, lon: PropTypes.number }),
  stoptimes: PropTypes.arrayOf(
    PropTypes.shape({
      realtimeState: PropTypes.string,
      stop: PropTypes.shape({ gtfsId: PropTypes.string }),
    }),
  ),
};
