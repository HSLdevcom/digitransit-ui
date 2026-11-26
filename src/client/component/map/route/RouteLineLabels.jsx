import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { useLeaflet } from 'react-leaflet/es/context';
import RouteLineLabel from './RouteLineLabel';
import chooseLabelPlacement from './labelPlacement';

const NO_LINE = [];

/**
 * Renders labels so that they cover neither the route line nor each other.
 * Earlier labels in the list get their preferred spot first.
 */
export default function RouteLineLabels({ labels, linePoints = NO_LINE }) {
  const { map } = useLeaflet();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map]);

  const placed = useMemo(() => {
    const project = point => map.project(L.latLng(point.lat, point.lon), zoom);
    const pixels = linePoints.map(project);
    const occupied = [];
    return labels.map(label => {
      const result = chooseLabelPlacement(
        project(label.position),
        pixels,
        label.text,
        label.placement,
        occupied,
      );
      occupied.push(result.rect);
      return { ...label, ...result };
    });
    // zoom changes the pixel geometry
  }, [map, zoom, labels, linePoints]);

  return placed.map(({ key, position, text, color, placement, dy, tailDy, tailAngle }) => (
    <RouteLineLabel
      key={key}
      position={position}
      text={text}
      color={color}
      placement={placement}
      dy={dy}
      tailDy={tailDy}
      tailAngle={tailAngle}
    />
  ));
}

const pointShape = PropTypes.shape({ lat: PropTypes.number, lon: PropTypes.number });

RouteLineLabels.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      position: pointShape.isRequired,
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      placement: PropTypes.oneOf(['right', 'left', 'pin']).isRequired,
    }),
  ).isRequired,
  linePoints: PropTypes.arrayOf(pointShape),
};
