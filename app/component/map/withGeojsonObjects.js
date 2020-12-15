import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import getContext from 'recompose/getContext';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import GeoJsonStore from '../../store/GeoJsonStore';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { isBrowser } from '../../util/browser';

const jsonModules = {
  GeoJSON: () => importLazy(import(/* webpackChunkName: "map" */ './GeoJSON')),
};

/**
 * Adds geojson map layers to the leafletObjs props of the given component. The component should be a component that renders the leaflet map.
 *
 * @param {*} Component The component to extend
 */
function withGeojsonObjects(Component) {
  function GeojsonWrapper({
    mapLayers,
    getGeoJsonConfig,
    getGeoJsonData,
    leafletObjs,
    config,
    ...props
  }) {
    const [geoJson, updateGeoJson] = useState(null);
    useEffect(() => {
      async function fetch() {
        if (!isBrowser) {
          return;
        }
        if (
          !config.geoJson ||
          (!Array.isArray(config.geoJson.layers) &&
            !config.geoJson.layerConfigUrl)
        ) {
          return;
        }
        const layers = config.geoJson.layerConfigUrl
          ? await getGeoJsonConfig(config.geoJson.layerConfigUrl)
          : config.geoJson.layers;
        if (Array.isArray(layers) && layers.length > 0) {
          const json = await Promise.all(
            layers.map(async ({ url, name, isOffByDefault, metadata }) => ({
              url,
              isOffByDefault,
              data: await getGeoJsonData(url, name, metadata),
            })),
          );
          const newGeoJson = {};
          json.forEach(({ url, data, isOffByDefault }) => {
            newGeoJson[url] = { ...data, isOffByDefault };
          });
          updateGeoJson(newGeoJson);
        }
      }
      fetch();
    }, []);

    const objs = leafletObjs;
    if (geoJson) {
      // bounds are only used when geojson only contains point geometries? TODO copy this from mapWithTracking if this causes problems
      const bounds = null;
      Object.keys(geoJson)
        .filter(
          key =>
            mapLayers.geoJson[key] !== false &&
            (mapLayers.geoJson[key] === true ||
              geoJson[key].isOffByDefault !== true),
        )
        .forEach(key => {
          objs.push(
            <LazilyLoad modules={jsonModules} key={key}>
              {({ GeoJSON }) => (
                <GeoJSON
                  bounds={bounds}
                  data={geoJson[key].data}
                  geoJsonZoomLevel={props.geoJsonZoomLevel}
                />
              )}
            </LazilyLoad>,
          );
        });
    }

    return <Component leafletObjs={objs} {...props} />;
  }
  const configShape = PropTypes.shape({
    geoJson: PropTypes.shape({
      layers: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string })),
      layerConfigUrl: PropTypes.string,
    }),
  });

  GeojsonWrapper.propTypes = {
    mapLayers: mapLayerShape.isRequired,
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
    leafletObjs: PropTypes.array,
    config: configShape.isRequired,
    geoJsonZoomLevel: PropTypes.number.isRequired,
  };
  GeojsonWrapper.defaultProps = {
    leafletObjs: [],
  };

  const WithContext = getContext({
    config: configShape,
  })(GeojsonWrapper);

  const WithStores = connectToStores(
    WithContext,
    [MapLayerStore, GeoJsonStore],
    ({ getStore }) => {
      const mapLayers = getStore(MapLayerStore).getMapLayers();
      const { getGeoJsonConfig, getGeoJsonData } = getStore(GeoJsonStore);
      return { mapLayers, getGeoJsonConfig, getGeoJsonData };
    },
  );
  return WithStores;
}

export default withGeojsonObjects;
