import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import cx from 'classnames';
import { dtLocationShape } from '../util/shapes';
import { locationToOTP } from '../util/otpStrings';
import Icon from './Icon';
import DTAutosuggestPanel from './DTAutosuggestPanel';

export default class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape,
    destination: dtLocationShape,
  };

  static contextTypes = {
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
    const tab = this.getSearchModalState();
    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <DTAutosuggestPanel
          origin={this.props.origin}
          destination={this.props.destination}
          tab={tab}
          isItinerary
        />
        <div className="switch" onClick={() => this.swapEndpoints()}>
          <span>
            <Icon img="icon-icon_direction-b" />
          </span>
        </div>
      </div>
    );
  }
}
