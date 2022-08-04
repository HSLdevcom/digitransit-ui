import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import MapBottomsheetContext from './MapBottomsheetContext';
import withGeojsonObjects from './withGeojsonObjects';

import LazilyLoad, { importLazy } from '../LazilyLoad';

const mapModules = {
  Map: () => importLazy(import(/* webpackChunkName: "map" */ './Map')),
};

function MapContainer({ className, children, ...props }) {
  return (
    <div className={`map ${className}`}>
      <LazilyLoad modules={mapModules}>
        {({ Map }) => {
          return (
            <MapBottomsheetContext.Consumer>
              {context => (
                <Map
                  {...props}
                  mapBottomPadding={context.mapBottomPadding || null}
                  buttonBottomPadding={context.buttonBottomPadding || null}
                />
              )}
            </MapBottomsheetContext.Consumer>
          );
        }}
      </LazilyLoad>
      {children}
    </div>
  );
}

MapContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  boundsOptions: PropTypes.shape({
    paddingBottomRight: PropTypes.arrayOf(PropTypes.number),
  }),
};

MapContainer.defaultProps = {
  className: '',
  children: undefined,
  boundsOptions: {},
};

export default connectToStores(
  withGeojsonObjects(MapContainer),
  ['PreferencesStore', 'MapModeStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
    mapMode: context.getStore('MapModeStore').getMapMode(),
  }),
);
