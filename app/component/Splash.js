import React from 'react';
import { FormattedMessage } from 'react-intl';

import OneTabSearchModal from './OneTabSearchModal';
import Icon from './Icon';
import GeopositionSelector from './GeopositionSelector';
import OriginSelector from './OriginSelector';
import Intro from './Intro';
import config from '../config';

class Splash extends React.Component {
  state = {
    searchModalIsOpen: false,
    shouldShowIntro: true,
  };

  onIntroFinished = () => this.setState({ shouldShowIntro: false })

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

  shouldShowIntro() {
    return config.shouldShowIntro && this.state.shouldShowIntro;
  }

  renderContents() {
    return (
      <div key="contents" className="flex-vertical">
        <h3>
          <FormattedMessage
            id="splash-welcome"
            defaultMessage="How do you want to start?"
          />
        </h3>
        <GeopositionSelector searchModalIsOpen={this.state.searchModalIsOpen} />
        <div className="splash-separator">
          <FormattedMessage id="splash-you-can-also" defaultMessage="You can also" />
        </div>
        <div id="splash-search-field-container" className="flex-vertical">
          <span id="splash-searchfield" onClick={this.openModal}>
            <FormattedMessage id="give-origin" defaultMessage="Type in your origin" />
            <Icon className="icon-edit" img="icon-icon_edit" />
          </span>
        </div>
        <div className="splash-separator">
          <FormattedMessage id="splash-or-choose" defaultMessage="or choose your origin from" />
        </div>
        <OriginSelector />
      </div>
    );
  }

  render() {
    return (
      <div className="fullscreen">
        <OneTabSearchModal
          modalIsOpen={this.state.searchModalIsOpen}
          closeModal={this.closeModal} initialValue="" target="origin"
        />
        <div className="front-page fullscreen">
          <div id="splash-map" className="fullscreen">
            <div className="map fullscreen">
              <div className="background-gradient" />
            </div>
          </div>
        </div>
        <div id="splash-wrapper">
          <div id="splash">
            {this.shouldShowIntro() ?
              <Intro onIntroFinished={this.onIntroFinished} finalSlide={this.renderContents()} /> :
              this.renderContents()
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Splash;
