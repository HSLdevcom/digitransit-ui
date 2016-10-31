import React from 'react';

import config from '../../config';
import Icon from '../icon/Icon';

const isBrowser = typeof window !== 'undefined' && window !== null;

const Popup = isBrowser ?
  require('react-leaflet/lib/Popup').default : null; // eslint-disable-line global-require

class SelectedStopLabel extends React.Component {
  static contextTypes = {
    popupContainer: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    shouldOpen: React.PropTypes.bool,
    stop: React.PropTypes.object.isRequired,
    header: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired,
  };

  static defaultProps = {
    shouldOpen: true,
  };

  componentDidMount() {
    console.log('componentDidMount');
    console.log(this.props);
    console.log(this.context);
    //return this.props.shouldOpen && setImmediate(this.display);
  }

  //display = () => this.context.popupContainer.openPopup();

  render() {
    return (
      <Popup
        position={{ lat: this.props.stop.lat, lng: this.props.stop.lon }}
        offset={[50, 25]}
        closeButton={false}
        maxWidth={config.map.genericMarker.popup.maxWidth}
        autoPan={false}
        className="origin-popup"
      >
        <div>
          <div className="origin-popup-header">
            {this.props.header}
          </div>
          <div>
            <div className="origin-popup-name">
              {this.props.content}
            </div>
            <div className="shade-to-white" />
          </div>
        </div>
      </Popup>
    );
  }
}

export default SelectedStopLabel;
