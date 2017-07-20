import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import uniq from 'lodash/uniq';
import { routerShape } from 'react-router';

import StopMarker from './StopMarker';
import TerminalMarker from './TerminalMarker';

class StopMarkerLayer extends React.Component {
  static contextTypes = {
    // Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    route: PropTypes.object.isRequired,
    map: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    stops: PropTypes.array.isRequired,
    hilightedStops: PropTypes.array,
  };

  render() {
    const stops = [];
    const renderedNames = [];
    const seen = [];

    this.props.stops.forEach(stop => {
      if (stop.routes.length === 0) {
        return;
      }

      const modeClass = stop.routes[0].mode.toLowerCase();
      const selected =
        this.props.hilightedStops &&
        this.props.hilightedStops.includes(stop.gtfsId);

      if (
        stop.parentStation &&
        this.context.map.getZoom() <=
          this.context.config.terminalStopsMaxZoom &&
        !seen.includes(stop.parentStation.gtfsId)
      ) {
        stops.push(
          <TerminalMarker
            key={stop.parentStation.gtfsId}
            terminal={stop.parentStation}
            selected={selected}
            mode={modeClass}
            renderName={false}
          />,
        );
        seen.push(stop.parentStation.gtfsId);
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

    return (
      <div>
        {uniq(stops, 'key')}
      </div>
    );
  }
}

export default createFragmentContainer(StopMarkerLayer, {
  stops: graphql`
    fragment StopMarkerLayer_stops on Stop @relay(plural: true) {
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
  `,
});
