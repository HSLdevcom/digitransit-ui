import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { matchShape } from 'found';
import {
  relayShape,
  configShape,
  mapLayerOptionsShape,
} from '../../util/shapes';
import NearYouMapContainer from './NearYouMapContainer';
import NearYouFavouritesMapContainer from './NearYouFavouritesMapContainer';
import { mapLayerShape } from '../../store/MapLayerStore';

const TransitStopModes = ['BUS', 'FERRY', 'RAIL', 'SUBWAY', 'TRAM'];

export default function MapWrapper(
  {
    match,
    relayEnvironment,
    favouriteStopIds,
    favouriteStationIds,
    favouriteVehicleStationIds,
    setCenterOfMap,
    mapLayers,
    mapLayerOptions,
    variables,
    ...rest
  },
  { config },
) {
  const commonProps = {
    match,
    onEndNavigation: setCenterOfMap,
    onMapTracking: setCenterOfMap,
  };
  const { mode } = match.params;

  if (mode === 'FAVORITE') {
    return (
      <QueryRenderer
        query={graphql`
          query MapWrapperFavouritesQuery(
            $stopIds: [String!]!
            $stationIds: [String!]!
            $vehicleRentalStationIds: [String!]!
          ) {
            stops: stops(ids: $stopIds) {
              ...NearYouFavouritesMapContainer_stops
            }
            stations: stations(ids: $stationIds) {
              ...NearYouFavouritesMapContainer_stations
            }
            vehicleStations: vehicleRentalStations(
              ids: $vehicleRentalStationIds
            ) {
              ...NearYouFavouritesMapContainer_vehicleStations
            }
          }
        `}
        variables={variables}
        environment={relayEnvironment}
        render={({ props }) => {
          const mapProps = props || {
            stops: null,
            stations: null,
            vehicleStations: null,
          };
          return (
            <NearYouFavouritesMapContainer
              mapLayers={mapLayers}
              favouriteIds={
                new Set([
                  ...favouriteStopIds,
                  ...favouriteStationIds,
                  ...favouriteVehicleStationIds,
                ])
              }
              {...commonProps}
              {...mapProps}
              {...rest}
            />
          );
        }}
      />
    );
  }

  const filteredMapLayers = {
    ...mapLayers,
    parkAndRide: mode === 'CARPARK',
    parkAndRideForBikes: mode === 'BIKEPARK',
    citybike: mode === 'CITYBIKE',
    citybikeOverrideMinZoom: mode === 'CITYBIKE',
  };
  if (!config.map.showLayerSelector) {
    filteredMapLayers.stop = {};
    if (TransitStopModes.includes(mode)) {
      filteredMapLayers.stop[mode.toLowerCase()] = true;
    }
  }
  let favouriteIds;
  switch (mode) {
    case 'CITYBIKE':
      favouriteIds = new Set(favouriteVehicleStationIds);
      break;
    case 'BIKEPARK':
    case 'CARPARK':
      favouriteIds = new Set();
      break;
    default:
      favouriteIds = new Set([...favouriteStopIds, ...favouriteStationIds]);
      break;
  }

  return (
    <QueryRenderer
      query={graphql`
        query MapWrapperStopsQuery(
          $lat: Float!
          $lon: Float!
          $filterByPlaceTypes: [FilterPlaceType]
          $filterByModes: [Mode]
          $first: Int!
          $maxResults: Int!
          $maxDistance: Int!
          $prioritizedStopIds: [String!]!
          $filterByNetwork: [String!]
        ) {
          stops: viewer {
            ...NearYouMapContainer_stops
              @arguments(
                lat: $lat
                lon: $lon
                filterByPlaceTypes: $filterByPlaceTypes
                filterByModes: $filterByModes
                first: $first
                maxResults: $maxResults
                maxDistance: $maxDistance
                filterByNetwork: $filterByNetwork
              )
          }
          prioritizedStops: stops(ids: $prioritizedStopIds) {
            ...NearYouMapContainer_prioritizedStops
          }
        }
      `}
      variables={variables}
      environment={relayEnvironment}
      render={({ props }) => {
        const mapProps = props || { stops: null, prioritizedStops: null };
        return (
          <NearYouMapContainer
            mapLayers={filteredMapLayers}
            mapLayerOptions={mapLayerOptions}
            favouriteIds={favouriteIds}
            {...commonProps}
            {...mapProps}
            {...rest}
          />
        );
      }}
    />
  );
}

MapWrapper.propTypes = {
  relayEnvironment: relayShape.isRequired,
  match: matchShape.isRequired,
  favouriteStopIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  favouriteStationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  favouriteVehicleStationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCenterOfMap: PropTypes.func.isRequired,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
  // eslint-disable-next-line
  variables: PropTypes.object.isRequired,
};

MapWrapper.contextTypes = { config: configShape.isRequired };
