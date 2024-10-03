import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import MapBottomsheetContext from './MapBottomsheetContext';
import withGeojsonObjects from './withGeojsonObjects';
import LazilyLoad, { importLazy } from '../LazilyLoad';

const mapModules = {
  Map: () => importLazy(import(/* webpackChunkName: "map" */ './Map')),
};

function MapContainer({ className, children, bottomPadding, ...props }) {
  const contextPadding = useContext(MapBottomsheetContext);
  return (
    <div className={`map ${className}`}>
      <LazilyLoad modules={mapModules}>
        {({ Map }) => {
          return (
            <Map {...props} bottomPadding={bottomPadding || contextPadding} />
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
  bottomPadding: PropTypes.number,
};

MapContainer.defaultProps = {
  className: '',
  children: undefined,
  bottomPadding: undefined,
};

export default connectToStores(
  withGeojsonObjects(MapContainer),
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);
