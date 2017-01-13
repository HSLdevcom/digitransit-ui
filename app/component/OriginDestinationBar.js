import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import without from 'lodash/without';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { storeEndpointIfNotCurrent, swapEndpoints } from '../action/EndpointActions';
import Icon from './Icon';
import OneTabSearchModal from './OneTabSearchModal';
import { getAllEndpointLayers } from '../util/searchUtils';

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
    origin: React.PropTypes.object,
    destination: React.PropTypes.object,
    originIsCurrent: React.PropTypes.bool,
    destinationIsCurrent: React.PropTypes.bool,
  }

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.context.executeAction(storeEndpointIfNotCurrent, { target: 'origin', endpoint: this.props.origin });
    this.context.executeAction(storeEndpointIfNotCurrent, { target: 'destination', endpoint: this.props.destination });
  }

  getSearchModalState = () => {
    if (this.context.location.state != null &&
        this.context.location.state.oneTabSearchModalOpen != null) {
      return this.context.location.state.oneTabSearchModalOpen;
    }
    return false;
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

  openSearchModal = (tab) => {
    this.context.router.push({
      ...this.context.location,
      state: {
        ...this.context.location.state,
        oneTabSearchModalOpen: tab,
      },
    });
  }

  render() {
    const ownPosition = this.context.intl.formatMessage({
      id: 'own-position',
      defaultMessage: 'Your current location',
    });
    const tab = this.getSearchModalState();

    let searchLayers = getAllEndpointLayers();
    // don't offer current pos if it is already used as a route end point
    if (this.props.originIsCurrent || this.props.destinationIsCurrent) {
      searchLayers = without(searchLayers, 'CurrentPosition');
    }

    return (
      <div className={cx('origin-destination-bar', this.props.className)}>
        <div className="field-link from-link" onClick={() => this.openSearchModal('origin')}>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon from" />
          <span className="link-name">
            {this.props.originIsCurrent ? ownPosition : this.props.origin.address}
          </span>
        </div>
        <div className="switch" onClick={() => this.swapEndpoints()}>
          <span>
            <Icon img="icon-icon_direction-b" />
          </span>
        </div>
        <div className="field-link to-link" onClick={() => this.openSearchModal('destination')}>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon to" />
          <span className="link-name">
            {this.props.destinationIsCurrent ?
              ownPosition : this.props.destination.address}
          </span>
        </div>
        <OneTabSearchModal
          layers={searchLayers}
          endpoint={this.props[tab]}
          target={tab}
          responsive
        />
      </div>);
  }
}

export default connectToStores(OriginDestinationBar, ['EndpointStore'], context => ({
  originIsCurrent: context.getStore('EndpointStore').getOrigin().useCurrentPosition,
  destinationIsCurrent: context.getStore('EndpointStore').getDestination().useCurrentPosition,
}));
