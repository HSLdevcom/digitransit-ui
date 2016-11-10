import React from 'react';
import { FormattedMessage } from 'react-intl';

import OneTabSearchModal from '../search/OneTabSearchModal';
import Icon from '../icon/Icon';
import GeopositionSelector from './GeopositionSelector';
import OriginSelector from './OriginSelector';

class Splash extends React.Component {
  state = {
    searchModalIsOpen: false,
  };

  openModal = () => {
    this.setState({
      searchModalIsOpen: true,
    });
  };

  closeModal = () => {
    this.setState({
      searchModalIsOpen: false,
    });
  };

  render = () => (
    <div className="fullscreen">
      <OneTabSearchModal
        modalIsOpen={this.state.searchModalIsOpen}
        closeModal={this.closeModal} initialValue="" target="origin"
      />
      <div className="front-page fullscreen">
        <div className="fullscreen splash-map">
          <div className="map fullscreen">
            <div className="background-gradient" />
          </div>
        </div>
      </div>
      <div id="splash">
        <GeopositionSelector />
        <span id="splash-searchfield" onClick={this.openModal}>
          <FormattedMessage id="give-origin" defaultMessage="Type in your origin" />
          <Icon className="icon-edit" img="icon-icon_edit" />
        </span>
        <div id="splash-separator">
          <FormattedMessage id="or-choose" defaultMessage="or choose" />
        </div>
        <OriginSelector />
      </div>
    </div>
  );
}

export default Splash;
