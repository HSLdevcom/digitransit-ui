import PropTypes from 'prop-types';
import React from 'react';

import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ? require('react-leaflet/lib/Popup').default : null; // eslint-disable-line global-require

class SelectedStopPopup extends React.Component {
  static propTypes = {
    shouldOpen: PropTypes.bool,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static defaultProps = {
    shouldOpen: true,
  };

  static displayName = 'SelectedStopLabel';

  render() {
    return (
      <Popup
        position={{ lat: this.props.lat, lng: this.props.lon }}
        offset={[50, 25]}
        closeButton={false}
        maxWidth={this.context.config.map.genericMarker.popup.maxWidth}
        autoPan={false}
        className="origin-popup"
      >
        {this.props.children}
      </Popup>
    );
  }
}

export default SelectedStopPopup;
