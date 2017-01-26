import React from 'react';

import { isBrowser } from '../../../util/browser';

const Popup = isBrowser ?
  require('react-leaflet/lib/Popup').default : null; // eslint-disable-line global-require

class SelectedStopPopup extends React.Component {
  static propTypes = {
    shouldOpen: React.PropTypes.bool,
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
    children: React.PropTypes.node.isRequired,
  };

  static contextTypes = {
    config: React.PropTypes.object.isRequired,
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
