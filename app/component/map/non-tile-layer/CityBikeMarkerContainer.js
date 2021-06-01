import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';

import { withLeaflet } from 'react-leaflet/es/context';

import CityBikeMarker from './CityBikeMarker';
import ComponentUsageExample from '../../ComponentUsageExample';

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
      <ReactRelayContext.Consumer>
        {({ environment }) => (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query CityBikeMarkerContainerQuery {
                viewer {
                  stations: bikeRentalStations {
                    lat
                    lon
                    stationId
                    networks
                    bikesAvailable
                    rentalUris {
                      web
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
                    <CityBikeMarker station={station} key={station.stationId} />
                  ))}
              </div>
            )}
          />
        )}
      </ReactRelayContext.Consumer>
    );
  }
}

export default withLeaflet(CityBikeMarkerContainer);
