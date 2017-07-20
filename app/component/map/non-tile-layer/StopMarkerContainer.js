import PropTypes from 'prop-types';
import React from 'react';

import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

import StopMarkerLayer from './StopMarkerLayer';

export default class StopMarkerContainer extends React.Component {
  static propTypes = {
    hilightedStops: PropTypes.arrayOf(PropTypes.string.isRequired),
  };

  static defaultProps = {
    hilightedStops: [],
  };

  static contextTypes = {
    map: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    if (context.map.getZoom() < context.config.stopsMinZoom) {
      this.state = {
        minLat: 0,
        minLon: 0,
        maxLat: 0,
        maxLon: 0,
      };
    } else {
      const bounds = context.map.getBounds();
      this.state = {
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      };
    }
  }

  componentDidMount() {
    this.context.map.on('moveend', this.onMapMove);
    this.onMapMove();
  }

  componentWillUnmount() {
    this.context.map.off('moveend', this.onMapMove);
  }

  onMapMove = () => {
    if (this.context.map.getZoom() >= this.context.config.stopsMinZoom) {
      const bounds = this.context.map.getBounds();

      this.setState({
        minLat: bounds.getSouth(),
        minLon: bounds.getWest(),
        maxLat: bounds.getNorth(),
        maxLon: bounds.getEast(),
      });
    } else {
      this.setState({
        minLat: 0,
        minLon: 0,
        maxLat: 0,
        maxLon: 0,
      });
    }
  };

  previousProps = [];

  render() {
    return (
      <QueryRenderer
        query={graphql`
          query StopMarkerContainerQuery(
            $minLat: Float!
            $minLon: Float!
            $maxLat: Float!
            $maxLon: Float!
            $agency: String
          ) {
            viewer {
              stops: stopsByBbox(
                minLat: $minLat
                minLon: $minLon
                maxLat: $maxLat
                maxLon: $maxLon
                agency: $agency
              ) {
                ...StopMarkerLayer_stops
              }
            }
          }
        `}
        variables={{
          minLat: this.state.minLat,
          minLon: this.state.minLon,
          maxLat: this.state.maxLat,
          maxLon: this.state.maxLon,
          agency: this.context.config.preferredAgency || null,
        }}
        environment={Store}
        render={({ props }) => {
          if (props) {
            this.previousProps = props.viewer.stops;
            return (
              <StopMarkerLayer
                stops={props.viewer.stops}
                hilightedStops={this.props.hilightedStops}
              />
            );
          }
          return (
            <StopMarkerLayer
              stops={this.previousProps}
              hilightedStops={this.props.hilightedStops}
            />
          );
        }}
      />
    );
  }
}
