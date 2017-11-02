import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';

import OneTabSearchModal from './OneTabSearchModal';
import Icon from './Icon';
import GeopositionSelector from './GeopositionSelector';
import OriginSelector from './OriginSelector';
import Intro from './Intro';

class Splash extends React.Component {
  static contextTypes = {
    router: routerShape,
    location: PropTypes.object,
  };
  static propTypes = {
    shouldShowIntro: PropTypes.bool.isRequired,
    setIntroShown: PropTypes.func.isRequired,
  };

  openModal = () => {
    this.context.router.push({
      ...this.context.location,
      state: {
        ...this.context.location.state,
        oneTabSearchModalOpen: true,
      },
    });
  };

  renderContents() {
    const modalOpen = Boolean(
      this.context.location.state &&
        this.context.location.state.oneTabSearchModalOpen,
    );
    return (
      <div key="contents" className="flex-vertical">
        <h3>
          <FormattedMessage
            id="splash-welcome"
            defaultMessage="How do you wish to start?"
          />
        </h3>
        <GeopositionSelector searchModalIsOpen={modalOpen} />
        <div className="splash-separator">
          <FormattedMessage id="splash-you-can-also" defaultMessage="or" />
        </div>
        <div id="splash-search-field-container" className="flex-vertical">
          <span id="splash-searchfield">
            <button
              className="noborder"
              onClick={this.openModal}
              style={{ display: 'block' }}
            >
              <FormattedMessage
                id="give-origin"
                defaultMessage="Enter your origin"
              />
              <Icon className="icon-edit" img="icon-icon_edit" />
            </button>
          </span>
        </div>
        <div className="splash-separator">
          <FormattedMessage
            id="splash-or-choose"
            defaultMessage="or select your origin"
          />
        </div>
        <OriginSelector />
      </div>
    );
  }

  render() {
    return (
      <div className="fullscreen">
        <OneTabSearchModal target="origin" />
        <div className="front-page fullscreen">
          <div id="splash-map" className="fullscreen">
            <div className="map fullscreen">
              <div className="background-gradient" />
            </div>
          </div>
        </div>
        <div id="splash-wrapper">
          <div id="splash">
            {this.props.shouldShowIntro ? (
              <Intro
                onIntroFinished={this.props.setIntroShown}
                finalSlide={this.renderContents()}
              />
            ) : (
              this.renderContents()
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Splash;
