/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { PlannerMessageType } from '../constants';

export const alertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
  alertHash: PropTypes.number,
  alertHeaderText: PropTypes.string,
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
  id: PropTypes.string,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string.isRequired,
    }),
  ),
});

export const childrenShape = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);

export const configShape = PropTypes.shape({
  CONFIG: PropTypes.string.isRequired,
});

export const dtlocationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
});

export const errorShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ message: PropTypes.string }),
]);

export const fareShape = PropTypes.shape({
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

export const geoJsonFeatureShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  geometry: PropTypes.shape({
    coordinates: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.number),
            PropTypes.number,
          ]),
        ),
      ]),
    ).isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  properties: PropTypes.object,
});

export const itineraryShape = PropTypes.shape({
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  duration: PropTypes.number,
  walkDistance: PropTypes.number,
  legs: PropTypes.arrayOf(PropTypes.object),
  emissionsPerPerson: PropTypes.shape({
    co2: PropTypes.number,
  }),
});

export const locationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
});

const StatusPropType = PropTypes.oneOf([
  'no-location',
  'searching-location',
  'prompt',
  'found-location',
  'found-address',
  'geolocation-denied',
  'geolocation-timeout',
  'geolocation-watch-timeout',
  'geolocation-not-supported',
  'reverse-geocoding-ready',
  'reverse-geocoding-in-progress',
]);

export const locationStateShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  gid: PropTypes.string,
  name: PropTypes.string,
  layer: PropTypes.string,
  status: StatusPropType,
  hasLocation: PropTypes.bool,
  isLocationingInProgress: PropTypes.bool,
  isReverseGeocodingInProgress: PropTypes.bool,
  locationingFailed: PropTypes.bool,
});

const MapLayerOptionShape = PropTypes.shape({
  isLocked: PropTypes.bool,
  isSelected: PropTypes.bool,
});

const MapLayerOptionStopOrTerminalShape = PropTypes.shape({
  bus: PropTypes.shape(MapLayerOptionShape),
  rail: PropTypes.shape(MapLayerOptionShape),
  tram: PropTypes.shape(MapLayerOptionShape),
  subway: PropTypes.shape(MapLayerOptionShape),
  ferry: PropTypes.shape(MapLayerOptionShape),
  funicular: PropTypes.shape(MapLayerOptionShape),
});

export const mapLayerOptionsShape = PropTypes.shape({
  parkAndRide: PropTypes.oneOfType([
    PropTypes.shape(MapLayerOptionShape),
    PropTypes.any,
  ]),
  stop: PropTypes.oneOfType([
    PropTypes.shape(MapLayerOptionStopOrTerminalShape),
    PropTypes.any,
  ]),
  terminal: PropTypes.oneOfType([
    PropTypes.shape(MapLayerOptionStopOrTerminalShape),
    PropTypes.any,
  ]),
  vehicles: PropTypes.oneOfType([
    PropTypes.shape(MapLayerOptionShape),
    PropTypes.any,
  ]),
  citybike: PropTypes.oneOfType([
    PropTypes.shape(MapLayerOptionShape),
    PropTypes.any,
  ]),
});

export const planShape = PropTypes.shape({
  itineraries: PropTypes.arrayOf(itineraryShape).isRequired,
  date: PropTypes.number,
});

export const plannerMessageShape = PropTypes.oneOf(
  Object.values(PlannerMessageType),
);

export const refShape = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.any }),
]);

export const relayShape = PropTypes.shape({
  refetchConnection: PropTypes.func,
  refetch: PropTypes.func,
  hasMore: PropTypes.func,
  loadMore: PropTypes.func,
  environment: PropTypes.object.isRequired,
});

export const routeShape = PropTypes.shape({
  gtfsId: PropTypes.string,
  mode: PropTypes.string,
  shortName: PropTypes.string,
  longName: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.number,
  alerts: PropTypes.arrayOf(alertShape),
});

const ROUTER_ERROR_CODES = Object.values(PlannerMessageType);

export const RoutingerrorShape = PropTypes.shape({
  code: PropTypes.oneOf(ROUTER_ERROR_CODES),
  inputField: PropTypes.oneOf(['DATE_TIME', 'TO', 'FROM']),
});

export const stopShape = PropTypes.shape({
  gtfsId: PropTypes.string.isRequired,
  name: PropTypes.string,
  code: PropTypes.string,
  lat: PropTypes.number,
  lon: PropTypes.number,
});

export const vehicleShape = PropTypes.shape({
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
