import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import cx from 'classnames';
import without from 'lodash/without';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { dtLocationShape } from '../util/shapes';
import { locationToOTP } from '../util/otpStrings';
import Icon from './Icon';
import OneTabSearchModal from './OneTabSearchModal';
import { getAllEndpointLayers } from '../util/searchUtils';

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape,
    destination: dtLocationShape,
    originIsCurrent: PropTypes.bool,
    destinationIsCurrent: PropTypes.bool,
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  getSearchModalState = () => {
    if (
      this.context.location.state != null &&
      this.context.location.state.oneTabSearchModalOpen != null
    ) {
      return this.context.location.state.oneTabSearchModalOpen;
    }
    return false;
  };

  swapEndpoints = () => {
    const destinationString = locationToOTP(this.props.origin);
    const originString = locationToOTP(this.props.destination);

    this.context.router.replace(`/reitti/${originString}/${destinationString}`);
  };

  openSearchModal = tab => {
    this.context.router.push({
      ...this.context.location,
      state: {
        ...this.context.location.state,
        oneTabSearchModalOpen: tab,
      },
    });
  };

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

    const originLabel = this.context.intl.formatMessage({
      id: 'origin-label-change',
      defaultMessage: 'Change origin',
    });
    const destinationLabel = this.context.intl.formatMessage({
      id: 'destination-label-change',
      defaultMessage: 'Change destination',
    });

    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <button
          id="open-origin"
          aria-label={originLabel}
          className="flex-grow noborder field-link"
          onClick={() => this.openSearchModal('origin')}
        >
          <div className="from-link">
            <Icon
              img={'icon-icon_mapMarker-point'}
              className="itinerary-icon from"
            />
            <span className="link-name">
              {this.props.originIsCurrent
                ? ownPosition
                : this.props.origin.address}
            </span>
          </div>
        </button>
        <div className="switch" onClick={() => this.swapEndpoints()}>
          <span>
            <Icon img="icon-icon_direction-b" />
          </span>
        </div>
        <button
          id="open-destination"
          aria-label={destinationLabel}
          className="flex-grow noborder field-link"
          onClick={() => this.openSearchModal('destination')}
        >
          <div className="to-link">
            <Icon
              img={'icon-icon_mapMarker-point'}
              className="itinerary-icon to"
            />
            <span className="link-name">
              {this.props.destinationIsCurrent
                ? ownPosition
                : this.props.destination.address}
            </span>
          </div>
        </button>
        <OneTabSearchModal layers={searchLayers} target={tab} responsive />
      </div>
    );
  }
}

export default connectToStores(
  OriginDestinationBar,
  ['EndpointStore'],
  context => ({
    originIsCurrent: context.getStore('EndpointStore').getOrigin()
      .useCurrentPosition,
    destinationIsCurrent: context.getStore('EndpointStore').getDestination()
      .useCurrentPosition,
  }),
);
