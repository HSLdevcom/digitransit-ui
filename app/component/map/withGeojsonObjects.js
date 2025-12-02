import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import GeoJsonStore from '../../store/GeoJsonStore';

/**
 * Adds geojson map layers to the leafletObjs props of the given component. The component should be a component that renders the leaflet map.
 *
 * @param {*} Component The component to extend
 */
function withGeojsonObjects(Component) {
  function GeojsonWrapper(
    { getGeoJsonConfig, getGeoJsonData, leafletObjs, ...props },
    { config },
  ) {
    const [geoJson, updateGeoJson] = useState(null);

    useEffect(() => {
      let isMounted = true;

      async function fetch() {
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
      fetch();
      return () => {
        isMounted = false;
      };
    }, []);
    // adding geoJson to leafletObj moved to map
    return <Component leafletObjs={leafletObjs} {...props} geoJson={geoJson} />;
  }

  const configShape = PropTypes.shape({
    geoJson: PropTypes.shape({
      layers: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        }),
      ),
      layerConfigUrl: PropTypes.string,
    }),
  });

  GeojsonWrapper.propTypes = {
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
    leafletObjs: PropTypes.arrayOf(PropTypes.node),
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
  };

  GeojsonWrapper.defaultProps = {
    leafletObjs: [],
    locationPopup: undefined,
    onSelectLocation: undefined,
  };

  GeojsonWrapper.contextTypes = {
    config: configShape.isRequired,
  };

  return connectToStores(GeojsonWrapper, [GeoJsonStore], ({ getStore }) => {
    const { getGeoJsonConfig, getGeoJsonData } = getStore(GeoJsonStore);
    return { getGeoJsonConfig, getGeoJsonData };
  });
}

export default withGeojsonObjects;
