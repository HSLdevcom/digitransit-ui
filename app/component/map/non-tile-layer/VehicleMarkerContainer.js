import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import { withLeaflet } from 'react-leaflet/es/context';
import { configShape } from '../../../util/shapes';

import VehicleMarker from './VehicleMarker';

class VehicleMarkerContainer extends React.Component {
  static contextTypes = {
    config: configShape.isRequired,
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
      this.context.config.vehicleRental.cityBikeMinZoom
    ) {
      return false;
    }
    return (
      <ReactRelayContext.Consumer>
        {({ environment }) => (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query VehicleMarkerContainerQuery {
                viewer {
                  stations: vehicleRentalStations {
                    lat
                    lon
                    stationId
                    rentalNetwork {
                      networkId
                    }
                    availableVehicles {
                      total
                    }
                  }
                }
              }
            `}
            render={({ props }) => (
              <div>
                {props &&
                  Array.isArray(props.viewer.stations) &&
                  props.viewer.stations.map(station => (
                    <VehicleMarker station={station} key={station.stationId} />
                  ))}
              </div>
            )}
          />
        )}
      </ReactRelayContext.Consumer>
    );
  }
}

export default withLeaflet(VehicleMarkerContainer);
