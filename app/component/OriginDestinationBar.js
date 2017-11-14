import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import cx from 'classnames';
import { dtLocationShape } from '../util/shapes';
import { locationToOTP } from '../util/otpStrings';
import Icon from './Icon';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';

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
    navigateTo({
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
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
