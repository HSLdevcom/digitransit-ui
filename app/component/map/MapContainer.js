import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import LazilyLoad, { importLazy } from '../LazilyLoad';

const mapModules = {
  Map: () => importLazy(import(/* webpackChunkName: "map" */ './Map')),
};

function MapContainer({ className, children, ...props }) {
  return (
    <div className={`map ${className || ''}`}>
      <LazilyLoad modules={mapModules}>
        {({ Map }) => <Map {...props} />}
      </LazilyLoad>
      <div className="background-gradient" />
      {children}
    </div>
  );
}

export default connectToStores(MapContainer, ['PreferencesStore'], context => ({
  lang: context.getStore('PreferencesStore').getLanguage(),
}));
