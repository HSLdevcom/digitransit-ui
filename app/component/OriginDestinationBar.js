import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';

import DTAutosuggestPanel from './DTAutosuggestPanel';
import { locationToOTP } from '../util/otpStrings';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../util/queryUtils';
import { dtLocationShape } from '../util/shapes';

export default class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape,
    destination: dtLocationShape,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    piwik: PropTypes.object,
  };

  get location() {
    return this.context.router.getCurrentLocation();
  }

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(this.context.router, newViaPoints.map(locationToOTP));

  swapEndpoints = () => {
    const { location } = this;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    navigateTo({
      base: location,
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
    });
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { location } = this;
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
          isItinerary
          initialViaPoints={getIntermediatePlaces(location.query)}
          updateViaPoints={this.updateViaPoints}
          swapOrder={this.swapEndpoints}
        />
      </div>
    );
  }
}
