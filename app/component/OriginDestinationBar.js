import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';

import { storeEndpoint, swapEndpoints } from '../action/EndpointActions';
import Icon from './Icon';
import OneTabSearchModal from './OneTabSearchModal';

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    origin: React.PropTypes.node,
    destination: React.PropTypes.node,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  state = {
    tabOpen: false,
  };

  componentWillMount() {
    this.context.executeAction(storeEndpoint, { target: 'origin', endpoint: this.props.origin });
    this.context.executeAction(storeEndpoint, { target: 'destination', endpoint: this.props.destination });
  }

  swapEndpoints= () => {
    this.context.executeAction(
      swapEndpoints,
      {
        router: this.context.router,
        location: this.context.location,
      },
    );
  }

  closeModal = () => {
    this.setState({
      tabOpen: false,
    });
  }

  openSearch = (tab) => {
    this.setState({
      tabOpen: tab,
    });
  }

  render() {
    const ownPosition = this.context.intl.formatMessage({
      id: 'own-position',
      defaultMessage: 'Your current location',
    });


    let initialValue = '';
    if (this.state[this.state.tabOpen]) {
      initialValue = this.props[this.state.tabOpen].useCurrentPosition ?
        ownPosition : this.props[this.state.tabOpen].address;
    }

    return (
      <div className={cx('origin-destination-bar', this.props.className)}>
        <div className="field-link from-link" onClick={() => this.openSearch('origin')}>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon from" />
          <span className="link-name">
            {this.props.origin.useCurrentPosition ? ownPosition : this.props.origin.address}
          </span>
        </div>
        <div className="switch" onClick={() => this.swapEndpoints()}>
          <span>
            <Icon img="icon-icon_direction-b" />
          </span>
        </div>
        <div className="field-link to-link" onClick={() => this.openSearch('destination')}>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon to" />
          <span className="link-name">
            {this.props.destination.useCurrentPosition ?
              ownPosition : this.props.destination.address}
          </span>
        </div>
        <OneTabSearchModal
          modalIsOpen={this.state.tabOpen}
          closeModal={this.closeModal}
          initialValue={initialValue}
          endpoint={this.props[this.state.tabOpen]}
          target={this.state.tabOpen}
          responsive
        />
      </div>);
  }
}

export default OriginDestinationBar;
