import PropTypes from 'prop-types';
import React, { lazy, Suspense } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import MapBottomsheetContext from './MapBottomsheetContext';
import withGeojsonObjects from './withGeojsonObjects';

const Map = lazy(() => import(/* webpackChunkName: "map" */ './Map'));

function MapContainer({ className, children, ...props }) {
  return (
    <div className={`map ${className}`}>
      <Suspense fallback="">
        <MapBottomsheetContext.Consumer>
          {context => (
            <Map
              {...props}
              mapBottomPadding={context.mapBottomPadding || null}
              buttonBottomPadding={context.buttonBottomPadding || null}
            />
          )}
        </MapBottomsheetContext.Consumer>
      </Suspense>
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
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);
