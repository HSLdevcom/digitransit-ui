/* eslint-disable import/prefer-default-export */
import PropTypes from 'prop-types';
import { PlannerMessageType } from '../constants';

export const AlertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
  alertHash: PropTypes.number,
  alertHeaderText: PropTypes.string,
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string.isRequired,
    }),
  ),
});

export const ChildrenShape = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);

export const dtLocationShape = PropTypes.shape({
  lat: PropTypes.number,
  lon: PropTypes.number,
  address: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
});

export const ErrorShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ message: PropTypes.string }),
]);

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

export const ItineraryShape = PropTypes.shape({
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  duration: PropTypes.number,
  walkDistance: PropTypes.number,
  legs: PropTypes.arrayOf(PropTypes.object),
  emissionsPerPerson: PropTypes.shape({
    co2: PropTypes.number,
  }),
});

export const LocationShape = PropTypes.shape({
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

export const LocationStateShape = PropTypes.shape({
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
  parkAndRide: PropTypes.oneOfType([
    PropTypes.shape(mapLayerOptionShape),
    PropTypes.any,
  ]),
  stop: PropTypes.oneOfType([
    PropTypes.shape(mapLayerOptionStopOrTerminalShape),
    PropTypes.any,
  ]),
  terminal: PropTypes.oneOfType([
    PropTypes.shape(mapLayerOptionStopOrTerminalShape),
    PropTypes.any,
  ]),
  vehicles: PropTypes.oneOfType([
    PropTypes.shape(mapLayerOptionShape),
    PropTypes.any,
  ]),
  citybike: PropTypes.oneOfType([
    PropTypes.shape(mapLayerOptionShape),
    PropTypes.any,
  ]),
});

export const PlanShape = PropTypes.shape({
  itineraries: PropTypes.arrayOf(ItineraryShape).isRequired,
});

export const PlannerMessageShape = PropTypes.oneOf(
  Object.values(PlannerMessageType),
);

export const refShape = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.any }),
]);

export const RelayShape = PropTypes.shape({
  refetchConnection: PropTypes.func,
  refetch: PropTypes.func,
  hasMore: PropTypes.func,
  loadMore: PropTypes.func,
  environment: PropTypes.object.isRequired,
});

export const RouteShape = PropTypes.shape({
  gtfsId: PropTypes.string,
  mode: PropTypes.string,
  shortName: PropTypes.string,
  longName: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.number,
  alerts: PropTypes.arrayOf(AlertShape),
});

const ROUTER_ERROR_CODES = Object.values(PlannerMessageType);

export const RoutingErrorShape = PropTypes.shape({
  code: PropTypes.oneOf(ROUTER_ERROR_CODES),
  inputField: PropTypes.oneOf(['DATE_TIME', 'TO', 'FROM']),
});

export const StopShape = PropTypes.shape({
  gtfsId: PropTypes.string.isRequired,
  name: PropTypes.string,
  code: PropTypes.string,
  lat: PropTypes.number,
  lon: PropTypes.number,
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
