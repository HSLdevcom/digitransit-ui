import React from 'react';
import PropTypes from 'prop-types';
import { default as L } from 'leaflet';

import { configShape, locationShape } from '../../util/shapes';
import GenericMarker from './GenericMarker';

export default function ClusterNumberMarker({ position, number }, { config }) {
  const objs = [];

  const getIcon = () => {
    const radius = 20;
    const iconSvg = `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle
          class="cluster-number-marker"
          cx="${radius}"
          cy="${radius}"
          r="${radius * 0.6}"
          fill="${config.colors.primary}"
          stroke="${config.colors.primary}"
          stroke-width="${radius * 0.8}"
          stroke-opacity="${0.3}"
        />
          <text
            x="50%"
            y="52%"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#fff"
            font-size="${radius * 0.8}px"
            font-family="Gotham XNarrow A, Gotham Rounded A, Gotham Rounded B, Roboto Condensed, Roboto, Arial, sans-serif"
          >
            ${number}
          </text>
      </svg>`;

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: 'map-cluster-number-marker disable-icon-border',
    });
  };

  objs.push(
    <GenericMarker
      key={`cluster_number_marker_${number}_lat_${position.lat}_lon_${position.lon}`}
      position={position}
      getIcon={getIcon}
      zIndexOffset={13000}
    />,
  );

  return <div>{objs}</div>;
}

ClusterNumberMarker.contextTypes = {
  config: configShape.isRequired,
};

ClusterNumberMarker.propTypes = {
  position: locationShape.isRequired,
  number: PropTypes.number.isRequired,
};
