import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import getContext from 'recompose/getContext';
import GeoJsonStore from '../../store/GeoJsonStore';
import { isBrowser } from '../../util/browser';

// TODO we want to support other custom layers, so we should rename to getCustomLayers()
const getGeoJSONLayers = async (config, getGeoJsonConfig) => {
  if (
    !config.geoJson ||
    (!Array.isArray(config.geoJson.layers) && !config.geoJson.layerConfigUrl)
  ) {
    return [];
  }
  return config.geoJson.layerConfigUrl
    ? getGeoJsonConfig(config.geoJson.layerConfigUrl)
    : config.geoJson.layers;
};

/**
 * Adds geojson map layers to the leafletObjs props of the given component. The component should be a component that renders the leaflet map.
 *
 * @param {*} Component The component to extend
 */
function withGeojsonObjects(Component) {
  function GeojsonWrapper({
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
        const customLayers = await getGeoJSONLayers(config, getGeoJsonConfig);
        if (Array.isArray(customLayers) && customLayers.length > 0) {
          const json = await Promise.all(
            customLayers.map(
              async ({
                url,
                name,
                isOffByDefault,
                metadata,
                icon,
                minZoom,
                type, // To support wmst
                layers, // WMST specific attribute
              }) => ({
                url,
                isOffByDefault,
                data:
                  (type || 'geojson') === 'geojson'
                    ? await getGeoJsonData(url, name, metadata)
                    : undefined,
                icon,
                minZoom,
                type,
                layers,
              }),
            ),
          );
          const newGeoJson = {};
          json.forEach(
            ({ url, data, isOffByDefault, icon, minZoom, type, layers }) => {
              newGeoJson[url] = {
                ...data,
                isOffByDefault,
                icon,
                minZoom,
                type,
                url,
                layers,
              };
            },
          );
          updateGeoJson(newGeoJson);
        }
      }
      fetch();
    }, []);
    // adding geoJson to leafletObj moved to map
    return <Component leafletObjs={leafletObjs} {...props} geoJson={geoJson} />;
  }
  const configShape = PropTypes.shape({
    geoJson: PropTypes.shape({
      layers: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string })),
      layerConfigUrl: PropTypes.string,
    }),
  });

  GeojsonWrapper.propTypes = {
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
    leafletObjs: PropTypes.array,
    config: configShape.isRequired,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
  };
  GeojsonWrapper.defaultProps = {
    leafletObjs: [],
  };

  const WithContext = getContext({
    config: configShape,
  })(GeojsonWrapper);

  const WithStores = connectToStores(
    WithContext,
    [GeoJsonStore],
    ({ getStore }) => {
      const { getGeoJsonConfig, getGeoJsonData } = getStore(GeoJsonStore);
      return { getGeoJsonConfig, getGeoJsonData };
    },
  );
  return WithStores;
}

export default withGeojsonObjects;
