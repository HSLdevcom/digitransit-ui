import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  getMapLayerSettings,
  setMapLayerSettings,
} from '../../utils/client/localStorage';
import { showRentalVehiclesOfType } from '../../utils/client/modeUtils';
import { TransportMode } from '../../utils/shared/constants';
import { useConfigContext } from '../client/ConfigContext';

const MapLayerContext = createContext(null);

function createInitialMapLayers(config) {
  const mapLayers = {
    parkAndRide: false,
    parkAndRideForBikes: false,
    stop: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      funicular: true,
      airplane: true,
    },
    terminal: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      airplane: true,
    },
    vehicles: false,
    geoJson: {},
  };
  mapLayers.citybike = showRentalVehiclesOfType(
    config.vehicleRental?.networks,
    TransportMode.Citybike,
    config,
  );
  mapLayers.scooter =
    config.transportModes?.scooter?.showIfSelectedForRouting &&
    showRentalVehiclesOfType(
      config.vehicleRental?.networks,
      TransportMode.Scooter,
      config,
    );
  if (config.hideMapLayersByDefault) {
    mapLayers.stop = Object.keys(mapLayers.stop).reduce(
      (layers, key) => ({ ...layers, [key]: false }),
      {},
    );
    mapLayers.citybike = false;
    mapLayers.scooter = false;
  }

  const storedMapLayers = getMapLayerSettings();
  if (Object.keys(storedMapLayers).length === 0) {
    return mapLayers;
  }
  return {
    ...mapLayers,
    ...storedMapLayers,
    terminal: { ...mapLayers.terminal, ...storedMapLayers.terminal },
  };
}

function mergeMapLayers(mapLayers, updates) {
  return {
    ...mapLayers,
    ...updates,
    stop: {
      ...mapLayers.stop,
      ...updates.stop,
    },
    geoJson: {
      ...mapLayers.geoJson,
      ...updates.geoJson,
    },
  };
}

function getMapLayersWithOverrides(mapLayers, skip) {
  if (!skip?.notThese && !skip?.force) {
    return mapLayers;
  }

  const layers = { ...mapLayers };
  if (skip.notThese) {
    skip.notThese.forEach(key => {
      if (typeof layers[key] === 'object') {
        layers[key] = {};
        Object.keys(mapLayers[key]).forEach(subKey => {
          layers[key][subKey] = false;
        });
      } else {
        layers[key] = false;
      }
    });
  }
  if (skip.force) {
    skip.force.forEach(key => {
      if (typeof layers[key] === 'object') {
        layers[key] = {};
        Object.keys(mapLayers[key]).forEach(subKey => {
          layers[key][subKey] = true;
        });
      } else {
        layers[key] = true;
      }
    });
  }
  return layers;
}

export function MapLayerProvider({ children = null }) {
  const config = useConfigContext();
  const [mapLayers, setMapLayers] = useState(() =>
    createInitialMapLayers(config),
  );
  const mapLayersRef = useRef(mapLayers);
  const updateMapLayers = useCallback(updates => {
    const nextMapLayers = mergeMapLayers(mapLayersRef.current, updates);
    mapLayersRef.current = nextMapLayers;
    setMapLayers(nextMapLayers);
    setMapLayerSettings({ ...nextMapLayers });
  }, []);

  const value = useMemo(
    () => ({ mapLayers, updateMapLayers }),
    [mapLayers, updateMapLayers],
  );
  return (
    <MapLayerContext.Provider value={value}>
      {children}
    </MapLayerContext.Provider>
  );
}

export function useMapLayers(skip) {
  const context = useContext(MapLayerContext);
  if (!context) {
    throw new Error('Map layer hooks must be used within a MapLayerProvider');
  }
  return {
    mapLayers: getMapLayersWithOverrides(context.mapLayers, skip),
    updateMapLayers: context.updateMapLayers,
  };
}

MapLayerProvider.propTypes = {
  children: PropTypes.node,
};
