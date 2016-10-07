import React from 'react';

import { intlShape, FormattedMessage } from 'react-intl';

import FrontPagePanelContainer from '../front-page/FrontPagePanelContainer';
import { setOriginToDefault } from '../../action/EndpointActions';
import FakeSearchBar from '../search/FakeSearchBar';
import { default as FakeSearchWithButton } from '../search/FakeSearchWithButton';
import OneTabSearchModal from '../search/OneTabSearchModal';

class Splash extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    displaySplash: React.PropTypes.bool,
    state: React.PropTypes.string,
    children: React.PropTypes.node,
  };

  constructor(...args) {
    super(...args);
    this.closeModal = this.closeModal.bind(this);

    this.state = {
      searchModalIsOpen: false,
    };
  }

  closeModal() {
    return this.setState({
      searchModalIsOpen: false,
    });
  }

  render() {
    if (this.props.displaySplash !== true) {
      return this.props.children;
    }


    const destinationPlaceholder = this.context.intl.formatMessage({
      id: 'destination-placeholder',
      defaultMessage: 'Where to? - address or stop',
    });

    const fakeSearchBar = (<FakeSearchBar
      placeholder={destinationPlaceholder} id="front-page-search-bar"
    />);

    return (<div className="fullscreen">
      <div className="front-page fullscreen">
        <div className="fullscreen splash-map">
          <FakeSearchWithButton fakeSearchBar={fakeSearchBar} />
          <div className="map fullscreen">
            <div className="background-gradient" />
          </div>
          <FrontPagePanelContainer />
        </div>
      </div>
      <div className="splash">
        <div className="top" />
        <div className="mid">
          <div className="spinner-loader" />
        </div>
        <div className="bottom">
        {((this.props.state === 'load') &&
          (<h2><FormattedMessage id="loading" defaultMessage="Loading..." /></h2>))
          || (<div>
            <h2 className="state">
              <FormattedMessage id="searching-position" defaultMessage="Searching position..." />
            </h2>
            <FormattedMessage id="or" defaultMessage="Or" />
            <br />
            <span
              className="cursor-pointer dotted-link medium" onClick={() => {
                this.setState({
                  searchModalIsOpen: true,
                });
              }}
            >
              <FormattedMessage id="give-origin" defaultMessage="Type in your origin" />
              <br />
              <br />
            </span>
            <span
              className="cursor-pointer dotted-link medium" onClick={() => {
                this.context.executeAction(setOriginToDefault);
              }}
            >
              <FormattedMessage id="skip-positioning" defaultMessage="Skip" />
            </span></div>)
        }
        </div>
        <OneTabSearchModal
          modalIsOpen={this.state.searchModalIsOpen}
          closeModal={this.closeModal} initialValue="" target="origin"
        />
      </div>
    </div>);
  }
}

export default Splash;
