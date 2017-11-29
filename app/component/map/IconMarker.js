import PropTypes from 'prop-types';
import React from 'react';
import { createPortal } from 'react-dom';

import { isBrowser } from '../../util/browser';

let L;
let Marker;

/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
  Marker = require('react-leaflet/es/Marker').default;
}
/* eslint-enaable global-require */

/* eslint-disable no-underscore-dangle */
export default class IconMarker extends React.Component {
  constructor(props, ...args) {
    super(props, ...args);
    const _this = this;

    this.Icon = L.Icon.extend({
      options: {
        // @section
        // @aka DivIcon options
        iconSize: [12, 12], // also can be set through CSS

        // iconAnchor: (Point),
        // popupAnchor: (Point),

        // @option html: String = ''
        // Custom HTML code to put inside the div element, empty by default.
        element: false,

        className: 'leaflet-div-icon',
      },

      createIcon(oldIcon) {
        const div =
          oldIcon && oldIcon.tagName === 'DIV'
            ? oldIcon
            : document.createElement('div');

        _this.setState({ div });

        this._setIconStyles(div, 'icon');

        return div;
      },

      createShadow() {
        return null;
      },
    });

    this.state = { icon: new this.Icon(props.icon) };
  }

  componentDidUpdate() {
    this.state.icon.initialize(this.props.icon);
  }

  render() {
    return [
      this.state.div &&
        createPortal(this.props.icon.element, this.state.div, 'icon'),
      <Marker key="marker" {...this.props} icon={this.state.icon} />,
    ];
  }
}

IconMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  icon: PropTypes.shape({
    element: PropTypes.node.isRequired,
  }).isRequired,
};
