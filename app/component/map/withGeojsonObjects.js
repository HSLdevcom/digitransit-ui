import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import GeoJsonStore from '../../store/GeoJsonStore';
import { useConfigContext } from '../../configurations/ConfigContext';

/**
 * Adds geojson map layers to the props of the given component.
 * The component should be a component that renders the leaflet map.
 *
 * @param {*} Component The component to extend
 */
export default function withGeojsonObjects(Component) {
  function GeojsonWrapper({ getGeoJsonConfig, getGeoJsonData, ...props }) {
    const config = useConfigContext();
    const [geoJson, updateGeoJson] = useState(null);

    useEffect(() => {
      let isMounted = true;

      async function fetchGeoJson() {
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
              url: Array.isArray(url) ? url[0] : url,
              isOffByDefault,
              data: await getGeoJsonData(url, name, metadata),
            })),
          );

          const newGeoJson = {};
          json.forEach(({ url, data, isOffByDefault }) => {
            if (data) {
              newGeoJson[url] = { ...data, isOffByDefault };
            }
          });

          if (isMounted) {
            updateGeoJson(newGeoJson);
          }
        }
      }

      fetchGeoJson();

      return () => {
        isMounted = false;
      };
    }, []);

    return <Component {...props} geoJson={geoJson} />;
  }

  GeojsonWrapper.propTypes = {
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
  };

  return connectToStores(GeojsonWrapper, [GeoJsonStore], ({ getStore }) => {
    const { getGeoJsonConfig, getGeoJsonData } = getStore(GeoJsonStore);
    return { getGeoJsonConfig, getGeoJsonData };
  });
}
