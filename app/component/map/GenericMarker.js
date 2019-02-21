import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';

import { withLeaflet } from 'react-leaflet/es/context';

import ComponentUsageExample from '../ComponentUsageExample';
import { isBrowser } from '../../util/browser';

let Marker;
let Popup;
let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  Marker = require('react-leaflet/es/Marker').default;
  Popup = require('react-leaflet/es/Popup').default;
  L = require('leaflet');
}
/* eslint-enable global-require */

class GenericMarker extends React.Component {
  static description = (
    <div>
      <p>A base class for markers.</p>
      <ComponentUsageExample description="">
        <GenericMarker
          position={{ lat: 60.1626075196532, lon: 24.939603788199364 }}
          mode="citybike"
          icons={{ smallIconSvg: 'smallIcon in svg', iconSvg: 'icon in svg' }}
          iconSizes={{ smallIconSvg: [8, 8], iconSvg: [20, 20] }}
          map="leaflet map object"
        />
      </ComponentUsageExample>
    </div>
  );

  static displayName = 'GenericMarker';

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    shouldRender: PropTypes.func,
    position: PropTypes.object.isRequired,
    getIcon: PropTypes.func.isRequired,
    renderName: PropTypes.bool,
    name: PropTypes.string,
    children: PropTypes.node,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    shouldRender: () => true,
  };

  state = { zoom: this.props.leaflet.map.getZoom() };

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapMove);
  }

  componentWillUnmount() {
    this.props.leaflet.map.off('zoomend', this.onMapMove);
  }

  onMapMove = () => this.setState({ zoom: this.props.leaflet.map.getZoom() });

  getMarker = () => (
    <Marker
      position={{ lat: this.props.position.lat, lng: this.props.position.lon }}
      icon={this.props.getIcon(this.state.zoom)}
    >
      <Popup
        offset={this.context.config.map.genericMarker.popup.offset}
        maxWidth={this.context.config.map.genericMarker.popup.maxWidth}
        minWidth={this.context.config.map.genericMarker.popup.minWidth}
        className="popup"
      >
        {this.props.children}
      </Popup>
    </Marker>
  );

  getNameMarker() {
    if (
      !this.props.renderName ||
      this.props.leaflet.map.getZoom() <
        this.context.config.map.genericMarker.nameMarkerMinZoom
    ) {
      return false;
    }

    return (
      <Marker
        key={`${this.props.name}_text`}
        position={{
          lat: this.props.position.lat,
          lng: this.props.position.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `<div>${this.props.name}</div>`,
          className: 'popup',
          iconSize: [150, 0],
          iconAnchor: [-8, 7],
        })}
      />
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    const { shouldRender } = this.props;
    const { zoom } = this.state;
    if (isFunction(shouldRender) && !shouldRender(zoom)) {
      return null;
    }

    return (
      <React.Fragment>
        {this.getMarker()}
        {this.getNameMarker()}
      </React.Fragment>
    );
  }
}

const leafletComponent = withLeaflet(GenericMarker);
export { leafletComponent as default, GenericMarker as Component };
