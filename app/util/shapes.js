/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';

export const dtLocationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
});

const mapLayerOptionShape = PropTypes.shape({
  isLocked: PropTypes.bool,
  isSelected: PropTypes.bool,
});

const mapLayerOptionStopOrTerminalShape = PropTypes.shape({
  bus: PropTypes.shape(mapLayerOptionShape),
  rail: PropTypes.shape(mapLayerOptionShape),
  tram: PropTypes.shape(mapLayerOptionShape),
  subway: PropTypes.shape(mapLayerOptionShape),
  ferry: PropTypes.shape(mapLayerOptionShape),
});

export const mapLayerOptionsShape = PropTypes.shape({
  parkAndRide: PropTypes.shape(mapLayerOptionShape),
  stop: PropTypes.shape(mapLayerOptionStopOrTerminalShape),
  terminal: PropTypes.shape(mapLayerOptionStopOrTerminalShape),
  vehicles: PropTypes.shape(mapLayerOptionShape),
  citybike: PropTypes.shape(mapLayerOptionShape),
});
