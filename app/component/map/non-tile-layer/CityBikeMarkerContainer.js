import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

import { withLeaflet } from 'react-leaflet/es/context';

import CityBikeMarker from './CityBikeMarker';
import ComponentUsageExample from '../../ComponentUsageExample';

const CityBikeMarkerWrapper = Relay.createContainer(
  ({ root }) => (
    <div>
      {root &&
        Array.isArray(root.stations) &&
        root.stations.map(station => (
          <CityBikeMarker station={station} key={station.stationId} />
        ))}
    </div>
  ),
  {
    fragments: {
      root: () => Relay.QL`
      fragment on QueryType {
        stations: bikeRentalStations {
          ${CityBikeMarker.getFragment('station')}
          stationId
          networks
        }
      }
    `,
    },
  },
);

class CityBikeMarkerContainer extends React.Component {
  static description = (
    <div>
      <p>
        Renders all citybike stations if zoom is over 14. Requires map to be
        found in props.
      </p>
      <ComponentUsageExample description="">
        <CityBikeMarkerContainer />
      </ComponentUsageExample>
    </div>
  );

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  }

  onMapZoom = () => this.forceUpdate();

  render() {
    if (
      this.props.leaflet.map.getZoom() <
      this.context.config.cityBike.cityBikeMinZoom
    ) {
      return false;
    }
    return (
      <Relay.Renderer
        Container={CityBikeMarkerWrapper}
        queryConfig={{
          name: 'ViewerRoute',
          queries: {
            root: () => Relay.QL`
              query {
                viewer
              }
           `,
          },
          params: {},
        }}
        environment={Relay.Store}
      />
    );
  }
}

export default withLeaflet(CityBikeMarkerContainer);
