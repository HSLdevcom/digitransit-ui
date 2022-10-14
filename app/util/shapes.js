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
  funicular: PropTypes.shape(mapLayerOptionShape),
});

export const mapLayerOptionsShape = PropTypes.shape({
  parkAndRide: PropTypes.shape(mapLayerOptionShape),
  stop: PropTypes.shape(mapLayerOptionStopOrTerminalShape),
  terminal: PropTypes.shape(mapLayerOptionStopOrTerminalShape),
  vehicles: PropTypes.shape(mapLayerOptionShape),
  citybike: PropTypes.shape(mapLayerOptionShape),
});

export const FareShape = PropTypes.shape({
  agency: PropTypes.shape({
    fareUrl: PropTypes.string,
    name: PropTypes.string,
  }),
  fareId: PropTypes.string,
  cents: PropTypes.number,
  isUnknown: PropTypes.bool,
  routeName: PropTypes.string,
  ticketName: PropTypes.string,
});

/**
 * Describes the type information for an OTP Service Alert object.
 */
export const ServiceAlertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  alertDescriptionTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertHash: PropTypes.number,
  alertHeaderText: PropTypes.string,
  alertHeaderTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertSeverityLevel: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
});

export const PatternShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  route: PropTypes.shape({
    mode: PropTypes.string,
    type: PropTypes.number,
  }),
});

export const RouteShape = PropTypes.shape({
  gtfsId: PropTypes.string,
  mode: PropTypes.string,
  shortName: PropTypes.string,
  longName: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.number,
  alerts: PropTypes.arrayOf(ServiceAlertShape),
});

export const VehicleShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  direction: PropTypes.number.isRequired,
  tripStartTime: PropTypes.string.isRequired,
  operatingDay: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  next_stop: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  lat: PropTypes.number,
  lon: PropTypes.number,
  shortName: PropTypes.string.isRequired,
  color: PropTypes.string,
  heading: PropTypes.number,
  headsign: PropTypes.string,
});
