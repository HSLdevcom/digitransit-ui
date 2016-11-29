import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import without from 'lodash/without';
import { swapEndpoints } from '../action/EndpointActions';
import Icon from './Icon';
import OneTabSearchModal from './OneTabSearchModal';
import { getAllEndpointLayers } from '../util/searchUtils';

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  state = {
    origin: undefined,
    destination: undefined,
    tabOpen: false,
  };

  componentWillMount() {
    this.onEndpointChange();
  }

  componentDidMount() {
    this.context.getStore('EndpointStore').addChangeListener(this.onEndpointChange);
  }

  componentWillUnmount() {
    this.context.getStore('EndpointStore').removeChangeListener(this.onEndpointChange);
  }

  onEndpointChange= () => {
    this.setState({
      origin: this.context.getStore('EndpointStore').getOrigin(),
      destination: this.context.getStore('EndpointStore').getDestination(),
    });
  }

  swapEndpoints= () => {
    this.context.executeAction(
      swapEndpoints,
      {
        router: this.context.router,
        location: this.context.location,
      }
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

    let searchLayers = getAllEndpointLayers();

    // don't offer current pos if it is already used as a route end point
    if ((this.state.origin && this.state.origin.useCurrentPosition) ||
        (this.state.destination && this.state.destination.useCurrentPosition)) {
      searchLayers = without(searchLayers, 'CurrentPosition');
    }

    let initialValue = '';
    if (this.state[this.state.tabOpen]) {
      initialValue = this.state[this.state.tabOpen].useCurrentPosition ?
        ownPosition : this.state[this.state.tabOpen].address;
    }

    return (
      <div className={cx('origin-destination-bar', this.props.className)}>
        <div className="field-link from-link" onClick={() => this.openSearch('origin')}>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon from" />
          <span className="link-name">
            {this.state.origin.useCurrentPosition ? ownPosition : this.state.origin.address}
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
            {this.state.destination.useCurrentPosition ?
              ownPosition : this.state.destination.address}
          </span>
        </div>
        <OneTabSearchModal
          modalIsOpen={this.state.tabOpen}
          closeModal={this.closeModal}
          initialValue={initialValue}
          layers={searchLayers}
          endpoint={this.state[this.state.tabOpen]}
          target={this.state.tabOpen}
        />
      </div>);
  }
}

export default OriginDestinationBar;
