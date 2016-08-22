import React from 'react';

import config from '../../../config';
import { cityBikeSearchRequest } from '../../../action/city-bike-actions';
import CityBikeMarker from './CityBikeMarker';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';

class CityBikeMarkerContainer extends React.Component {
  static description = (
    <div>
      <p>Renders all citybike stations if zoom is over 14. Requires map to be found in props.</p>
      <ComponentUsageExample description="">
        <CityBikeMarkerContainer />
      </ComponentUsageExample>
    </div>
  );

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    map: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    const data = this.context.getStore('CityBikeStore').getData();

    if (!data || !data.stations) {
      this.context.executeAction(cityBikeSearchRequest);
    }

    this.context.getStore('CityBikeStore').addChangeListener(this.onCityBikeChange);
  }

  componentDidMount() {
    this.context.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    this.context.map.off('zoomend', this.onMapZoom);
    this.context.getStore('CityBikeStore').removeChangeListener(this.onCityBikeChange);
  }

  onMapZoom = () => this.forceUpdate()

  onCityBikeChange = () => this.forceUpdate()

  getStations() {
    const data = this.context.getStore('CityBikeStore').getData();

    // TODO: set showName
    return data && data.stations && data.stations.map(station => (
      <CityBikeMarker key={station.id} station={station} />
    ));
  }

  render() {
    return (
      <div>
        {this.context.map.getZoom() >= config.cityBike.cityBikeMinZoom ? this.getStations() : false}
      </div>
    );
  }
}

export default CityBikeMarkerContainer;
