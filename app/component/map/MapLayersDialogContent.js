import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import { mapLayerOptionsShape } from '../../util/shapes';
import { isKeyboardSelectionEvent } from '../../util/browser';
import Icon from '../Icon';
import Checkbox from '../Checkbox';
import GeoJsonStore from '../../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import { updateMapLayers } from '../../action/MapLayerActions';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import withGeojsonObjects from './withGeojsonObjects';
import {
  getTransportModes,
  showRentalVehiclesOfType,
} from '../../util/modeUtils';
import { TransportMode } from '../../constants';
import { useConfigContext } from '../../configurations/ConfigContext';

const sendLayerChangeAnalytic = (name, enable) => {
  const action = enable ? 'ShowMapLayer' : 'HideMapLayer';
  addAnalyticsEvent({
    category: 'Map',
    action,
    name,
  });
};

function MapLayersDialogContent({
  mapLayers,
  mapLayerOptions,
  setOpen,
  updateLayers,
  geoJson,
}) {
  const config = useConfigContext();
  const transportModes = getTransportModes(config);

  const arr = geoJson
    ? Object.entries(geoJson).map(([k, v]) => ({
        url: k,
        ...v,
      }))
    : undefined;

  const isTransportModeEnabled = transportMode =>
    transportMode && transportMode.availableForSelection;

  return (
    <Fragment>
      <button
        className="panel-close"
        onClick={setOpen}
        onKeyDown={e => isKeyboardSelectionEvent(e) && setOpen()}
        type="button"
      >
        <Icon img="icon_close" />
      </button>

      <span className="map-layer-header">
        <FormattedMessage id="select-map-layers-header" />
      </span>

      <div className="checkbox-grouping" />

      {config.vehicles && (
        <div className="checkbox-grouping">
          <Checkbox
            large
            checked={
              !mapLayerOptions
                ? mapLayers.vehicles
                : !!mapLayerOptions?.vehicles?.isLocked &&
                  !!mapLayerOptions?.vehicles?.isSelected
            }
            disabled={!!mapLayerOptions?.vehicles?.isLocked}
            defaultMessage="Moving vehicles"
            labelId="map-layer-vehicles"
            onChange={e => {
              updateLayers({ vehicles: e.target.checked });
              sendLayerChangeAnalytic('Vehicles', e.target.checked);
            }}
          />
        </div>
      )}

      <div className="checkbox-grouping">
        {isTransportModeEnabled(transportModes.bus) && (
          <Checkbox
            large
            checked={mapLayers.stop.bus}
            disabled={!!mapLayerOptions?.stop?.bus?.isLocked}
            defaultMessage="Bus stop"
            labelId="map-layer-stop-bus"
            onChange={e => {
              updateLayers({ stop: { bus: e.target.checked } });
              sendLayerChangeAnalytic('BusStop', e.target.checked);
            }}
          />
        )}

        {isTransportModeEnabled(transportModes.tram) && (
          <Checkbox
            large
            checked={mapLayers.stop.tram}
            disabled={!!mapLayerOptions?.stop?.tram?.isLocked}
            defaultMessage="Tram stop"
            labelId="map-layer-stop-tram"
            onChange={e => {
              updateLayers({ stop: { tram: e.target.checked } });
              sendLayerChangeAnalytic('TramStop', e.target.checked);
            }}
          />
        )}

        {isTransportModeEnabled(transportModes.ferry) && (
          <Checkbox
            large
            checked={mapLayers.stop.ferry}
            disabled={!!mapLayerOptions?.stop?.ferry?.isLocked}
            defaultMessage="Ferry"
            labelId="map-layer-stop-ferry"
            onChange={e => {
              updateLayers({ stop: { ferry: e.target.checked } });
              sendLayerChangeAnalytic('FerryStop', e.target.checked);
            }}
          />
        )}

        {showRentalVehiclesOfType(
          config.vehicleRental?.networks,
          TransportMode.Citybike,
        ) && (
          <Checkbox
            large
            checked={mapLayers.citybike}
            disabled={!!mapLayerOptions?.citybike?.isLocked}
            defaultMessage="Citybike station"
            labelId="map-layer-citybike"
            onChange={e => {
              updateLayers({ citybike: e.target.checked });
              sendLayerChangeAnalytic('Citybike', e.target.checked);
            }}
          />
        )}

        {showRentalVehiclesOfType(
          config.vehicleRental?.networks,
          TransportMode.Scooter,
        ) && (
          <Checkbox
            large
            checked={mapLayers.scooter}
            disabled={!!mapLayerOptions?.scooter?.isLocked}
            defaultMessage="Scooters"
            labelId="map-layer-scooter"
            onChange={e => {
              updateLayers({ scooter: e.target.checked });
              sendLayerChangeAnalytic('Scooter', e.target.checked);
            }}
          />
        )}

        {isTransportModeEnabled(transportModes.funicular) && (
          <Checkbox
            large
            checked={mapLayers.stop.funicular}
            disabled={!!mapLayerOptions?.stop?.funicular?.isLocked}
            defaultMessage="Funicular"
            labelId="map-layer-stop-funicular"
            onChange={e => {
              updateLayers({ stop: { funicular: e.target.checked } });
              sendLayerChangeAnalytic('FunicularStop', e.target.checked);
            }}
          />
        )}

        {isTransportModeEnabled(transportModes.airplane) && (
          <Checkbox
            large
            checked={mapLayers.stop.airplane}
            disabled={!!mapLayerOptions?.stop?.airplane?.isLocked}
            defaultMessage="Airport"
            labelId="map-layer-stop-airplane"
            onChange={e => {
              updateLayers({ stop: { airplane: e.target.checked } });
              sendLayerChangeAnalytic('AirplaneStop', e.target.checked);
            }}
          />
        )}

        {config.parkAndRide?.showParkAndRide && (
          <Checkbox
            large
            checked={mapLayers.parkAndRide}
            disabled={!!mapLayerOptions?.parkAndRide?.isLocked}
            defaultMessage="Park &amp; ride"
            labelId="map-layer-park-and-ride"
            onChange={e => {
              updateLayers({ parkAndRide: e.target.checked });
              sendLayerChangeAnalytic('ParkAndRide', e.target.checked);
            }}
          />
        )}

        {config.parkAndRide?.showParkAndRideForBikes && (
          <Checkbox
            large
            checked={mapLayers.parkAndRideForBikes}
            disabled={!!mapLayerOptions?.parkAndRideForBikes?.isLocked}
            defaultMessage="Park &amp; ride bike parking"
            labelId="map-layer-park-and-ride-bike"
            onChange={e => {
              updateLayers({ parkAndRideForBikes: e.target.checked });
              sendLayerChangeAnalytic('ParkAndRideForBikes', e.target.checked);
            }}
          />
        )}
      </div>

      {arr && Array.isArray(arr) && (
        <div className="checkbox-grouping">
          {arr.map(gj => (
            <Checkbox
              large
              checked={
                (gj.isOffByDefault && mapLayers.geoJson[gj.url] === true) ||
                (!gj.isOffByDefault && mapLayers.geoJson[gj.url] !== false)
              }
              defaultMessage={gj.name[config.language]}
              key={gj.url}
              onChange={e => {
                const newSetting = {};
                newSetting[gj.url] = e.target.checked;
                updateLayers({ geoJson: newSetting });
                sendLayerChangeAnalytic('Zones', e.target.checked);
              }}
            />
          ))}
        </div>
      )}
    </Fragment>
  );
}

MapLayersDialogContent.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape,
  setOpen: PropTypes.func.isRequired,
  updateLayers: PropTypes.func.isRequired,
  geoJson: PropTypes.object /* eslint-disable-line */,
};

export const getGeoJsonLayersOrDefault = (
  config,
  store,
  defaultValue = undefined,
) => {
  return (
    (Array.isArray(config.geoJson?.layers) && config.geoJson.layers) ||
    (store && Array.isArray(store.layers) && store.layers) ||
    defaultValue
  );
};

const connectedComponent = connectToStores(
  withGeojsonObjects(MapLayersDialogContent),
  [GeoJsonStore, MapLayerStore],
  ({ executeAction }) => ({
    updateLayers: mapLayers => executeAction(updateMapLayers, { ...mapLayers }),
  }),
  {
    executeAction: PropTypes.func,
  },
);

export { connectedComponent as default, MapLayersDialogContent as Component };
