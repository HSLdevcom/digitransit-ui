import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import MapBottomsheetContext from './MapBottomsheetContext';
import withGeojsonObjects from './withGeojsonObjects';
import Map from './Map';

function MapContainer({ className, children, ...props }) {
  const contextPadding = useContext(MapBottomsheetContext);
  return (
    <div className={`map ${className}`}>
      <Map {...props} bottomPadding={contextPadding} />
      {children}
    </div>
  );
}

MapContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

MapContainer.defaultProps = {
  className: '',
  children: undefined,
};

export default connectToStores(
  withGeojsonObjects(MapContainer),
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);
