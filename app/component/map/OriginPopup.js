import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../Icon';
import { isBrowser } from '../../util/browser';

const Popup = isBrowser ?
  require('react-leaflet/lib/Popup').default : null; // eslint-disable-line global-require

class OriginPopup extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    popupContainer: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    shouldOpen: React.PropTypes.bool,
    yOffset: React.PropTypes.number.isRequired,
    text: React.PropTypes.string.isRequired,
    header: React.PropTypes.string.isRequired,
  };

  componentDidMount() {
    return this.props.shouldOpen && setTimeout(this.display);
  }

  display = () => this.context.popupContainer.openPopup();

  openDialog = () => this.context.router.push({
    ...this.context.location,
    state: {
      ...this.context.location.state,
      searchModalIsOpen: true,
      selectedTab: 'origin',
    },
  });

  render() {
    return (
      <Popup
        context={this.context}
        offset={[50, this.props.yOffset]}
        closeButton={false}
        maxWidth={this.context.config.map.genericMarker.popup.maxWidth}
        autoPan={false}
        className="origin-popup"
      >
        <div onClick={this.openDialog}>
          <div className="origin-popup-header">
            {this.props.header}
            <Icon className="icon-edit" img="icon-icon_edit" />
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
