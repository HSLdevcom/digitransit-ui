import React from 'react';
import config from '../../config';

const isBrowser = typeof window !== 'undefined' && window !== null;

const Popup = isBrowser ?
  require('react-leaflet/lib/Popup').default : null; // eslint-disable-line global-require

import { openDialog } from '../../action/SearchActions';
import { intlShape } from 'react-intl';
import Icon from '../icon/icon';

class OriginPopup extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    popupContainer: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    shouldOpen: React.PropTypes.bool,
    yOffset: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired,
    header: React.PropTypes.string.isRequired,
  };

  componentDidMount() {
    return this.props.shouldOpen && setImmediate(this.display);
  }

  display = () => this.context.popupContainer.openPopup();

  render() {
    return (
      <Popup
        context={this.context}
        ref="popup"
        offset={[50, this.props.yOffset]}
        closeButton={false}
        maxWidth={config.map.genericMarker.popup.maxWidth}
        autoPan={false}
        className="origin-popup"
      >
        <div onClick={() => this.context.executeAction(openDialog, 'origin')}>
          <div className="origin-popup">
            {this.props.header}
            <Icon className="right-arrow" img="icon-icon_arrow-collapse--right" />
          </div>
          <div>
            <div className="origin-popup-name">{this.props.text}</div>
            <div className="shade-to-white" /></div>
        </div>
      </Popup>
    );
  }
}

export default OriginPopup;
