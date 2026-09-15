import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import Polyline from 'react-leaflet/es/Polyline';
import { useConfigContext } from '../../client/ConfigContext';

// https://github.com/Leaflet/Leaflet/issues/2662
// updating className does not work currently :(

export default function Line({
  thin = false,
  opaque = false,
  passive = false,
  color = undefined,
  mode,
  geometry,
  appendClass = undefined,
}) {
  const config = useConfigContext();
  const line = useRef(null);
  const halo = useRef(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    // If we accidently draw the thin line over a normal one,
    // the halo will block it completely and we only see the thin one.
    // So we send the thin line layers (Leaflet calls every polyline its
    // own layer) to bottom. Note that all polylines do render inside the
    // same SVG, so CSS z-index can't be used.
    // Run only on mount, mirroring the previous componentDidMount.
    if (thin) {
      if (line.current) {
        line.current.leafletElement.bringToBack();
      }
      if (halo.current) {
        halo.current.leafletElement.bringToBack();
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      if (!passive && !thin && !opaque && line.current) {
        line.current.leafletElement.bringToFront();
      }
    } else {
      hasMounted.current = true;
    }
  });

  const className = cx([mode, { thin }, { opaque }, 'map-line']);
  const filteredPoints =
    geometry &&
    geometry.filter(
      point =>
        (typeof point.lat === 'number' && typeof point.lon === 'number') ||
        (typeof point[0] === 'number' && typeof point[1] === 'number'),
    );

  if (!filteredPoints || filteredPoints.length === 0) {
    return null;
  }

  const lineConfig = config.map.line;

  let lineColor = color || 'currentColor';
  let haloWeight = thin ? lineConfig.halo.thinWeight : lineConfig.halo.weight;
  let legWeight = thin ? lineConfig.leg.thinWeight : lineConfig.leg.weight;

  if (mode === 'walk') {
    legWeight *= 0.8;
  }
  if (mode === 'walk-inside') {
    legWeight *= 0.8;
  }
  if (mode === 'ferry-external') {
    haloWeight *= 0.6;
    legWeight *= 0.6;
  }
  if (passive) {
    haloWeight *= 0.5;
    legWeight *= 0.5;
    if (lineConfig.passiveColor) {
      lineColor = lineConfig.passiveColor;
    }
  }
  if (opaque) {
    haloWeight *= 0.65;
    legWeight *= 0.5;
  }

  return (
    <div style={{ display: 'none' }}>
      <Polyline
        key="halo"
        ref={halo}
        positions={filteredPoints}
        className={`leg-halo ${className} ${appendClass}`}
        weight={haloWeight}
        interactive={false}
      />
      <Polyline
        key="line"
        ref={line}
        positions={filteredPoints}
        className={`leg ${className} ${appendClass}`}
        color={lineColor}
        weight={legWeight}
        interactive={false}
      />
    </div>
  );
}

Line.propTypes = {
  thin: PropTypes.bool,
  opaque: PropTypes.bool,
  passive: PropTypes.bool,
  color: PropTypes.string,
  mode: PropTypes.string.isRequired,
  geometry: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.number),
    ]),
  ).isRequired,
  appendClass: PropTypes.string,
};
