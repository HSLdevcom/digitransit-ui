import React from 'react';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Map from './map';
import ToggleMapTracking from '../navigation/toggle-map-tracking';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withReducer from 'recompose/withReducer';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

function mapStateReducer(state, action) {
  switch (action.type) {
    case 'enable':
      return {
        ...state,
        initialZoom: false,
        mapTracking: true,
        focusOnOrigin: false,
      };
    case 'disable':
      return {
        ...state,
        initialZoom: false,
        mapTracking: false,
        focusOnOrigin: false,
      };
    case 'useOrigin':
      return {
        ...state,
        initialZoom: false,
        mapTracking: false,
        focusOnOrigin: true,
        previousOrigin: action.origin,
      };
    case 'usePosition':
      return {
        ...state,
        initialZoom: false,
        mapTracking: true,
        focusOnOrigin: false,
        previousOrigin: action.origin,
      };
    default:
      return state;
  }
}

const withMapStateTracking = withReducer('mapState', 'dispatch', mapStateReducer, () =>
  ({
    initialZoom: true,
    mapTracking: true,
    focusOnOrigin: false,
  })
);

const onlyUpdateCoordChanges = onlyUpdateForKeys(['lat', 'lon', 'zoom', 'mapTracking']);

const MapWithTracking =
  withMapStateTracking(
    connectToStores(
      onlyUpdateCoordChanges(Map),
      ['PositionStore', 'EndpointStore'],
      (context, props) => {
        const { mapTracking } = props.mapState;
        const PositionStore = context.getStore('PositionStore');
        const position = PositionStore.getLocationState();
        const origin = context.getStore('EndpointStore').getOrigin();

        let location = (() => {
          if (props.mapState.focusOnOrigin && !origin.useCurrentPosition) {
            return origin;
          } else if (mapTracking && position.hasLocation) {
            return position;
          }
          return false;
        })();

        if (!origin.useCurrentPosition && origin !== props.mapState.previousOrigin) {
          setImmediate(props.dispatch, {
            type: 'useOrigin',
            origin,
          });
          location = origin;
        } else if (
          origin.useCurrentPosition &&
          props.mapState.previousOrigin &&
          origin !== props.mapState.previousOrigin
        ) {
          setImmediate(props.dispatch, {
            type: 'usePosition',
            origin,
          });
          location = position;
        }

        function enableMapTracking() {
          if (!mapTracking) {
            props.dispatch({
              type: 'enable',
            });
          }
        }

        function disableMapTracking() {
          if (mapTracking) {
            props.dispatch({
              type: 'disable',
            });
          }
        }

        const children = React.Children.toArray(props.children);

        const mapToggle =
          (<ToggleMapTracking
            key="toggleMapTracking"
            handleClick={mapTracking ? disableMapTracking : enableMapTracking}
            className={`icon-mapMarker-toggle-positioning-${mapTracking ? 'online' : 'offline'}`}
          />);

        if (position.hasLocation) {
          children.push(mapToggle);
        }

        return {
          lat: location ? location.lat : null,
          lon: location ? location.lon : null,
          zoom: props.mapState.initialZoom ? 16 : null,
          mapTracking,
          position,
          className: 'fullscreen',
          displayOriginPopup: true,
          leafletEvents: {
            onDragstart: disableMapTracking,
            onZoomend: disableMapTracking,
          },
          disableMapTracking,
          children,
        };
      }
    )
  );

MapWithTracking.contextTypes = {
  getStore: React.PropTypes.func.isRequired,
};

MapWithTracking.description =
  (<div>
    <p>Renders a map with map-tracking functionality</p>
    <ComponentUsageExample description="">
      <MapWithTracking />
    </ComponentUsageExample>
  </div>);

export default MapWithTracking;
