import React from 'react';
import Relay from 'react-relay';
import uniq from 'lodash/uniq';
import { routerShape } from 'react-router';

import StopMarker from './StopMarker';
import TerminalMarker from './TerminalMarker';

class StopMarkerLayer extends React.Component {
  static contextTypes = {
    // Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: routerShape.isRequired,
    route: React.PropTypes.object.isRequired,
    map: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    relay: React.PropTypes.shape({
      setVariables: React.PropTypes.func.isRequired,
    }).isRequired,
    stopsInRectangle: React.PropTypes.shape({
      stopsByBbox: React.PropTypes.array.isRequired,
    }).isRequired,
    hilightedStops: React.PropTypes.array,
  }

  componentDidMount() {
    this.context.map.on('moveend', this.onMapMove);
    this.onMapMove();
  }

  componentWillUnmount() {
    this.context.map.off('moveend', this.onMapMove);
  }

  onMapMove = () => {
    let bounds;

    if (this.context.map.getZoom() >= this.context.config.stopsMinZoom) {
      bounds = this.context.map.getBounds();

      this.props.relay.setVariables({
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      });
    }
    this.forceUpdate();
  }

  getStops() {
    const stops = [];
    const renderedNames = [];

    this.props.stopsInRectangle.stopsByBbox.forEach((stop) => {
      if (stop.routes.length === 0) {
        return;
      }

      const modeClass = stop.routes[0].mode.toLowerCase();
      const selected = this.props.hilightedStops && this.props.hilightedStops.includes(stop.gtfsId);

      if (stop.parentStation &&
          this.context.map.getZoom() <= this.context.config.terminalStopsMaxZoom) {
        stops.push(
          <TerminalMarker
            key={stop.parentStation.gtfsId}
            terminal={stop.parentStation}
            selected={selected}
            mode={modeClass}
            renderName={false}
          />,
        );
        return;
      }
      stops.push(
        <StopMarker
          key={stop.gtfsId}
          stop={stop}
          selected={selected}
          mode={modeClass}
          renderName={!renderedNames.includes(stop.name)}
        />,
      );

      renderedNames.push(stop.name);
    });

    return uniq(stops, 'key');
  }

  render() {
    return (
      <div>
        {this.context.map.getZoom() >= this.context.config.stopsMinZoom ? this.getStops() : false}
      </div>
    );
  }
}

export default Relay.createContainer(StopMarkerLayer, {
  fragments: {
    stopsInRectangle: () => Relay.QL`
      fragment on QueryType {
        stopsByBbox(
          minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon, agency: $agency
        ) {
          lat
          lon
          gtfsId
          name
          locationType
          platformCode
          parentStation {
            gtfsId
            name
            lat
            lon
            stops {
              gtfsId
              lat
              lon
            }
          }
          routes {
            mode
          }
        }
      }
    `,
  },

  initialVariables: {
    minLat: null,
    minLon: null,
    maxLat: null,
    maxLon: null,
    agency: null,
  },
});
