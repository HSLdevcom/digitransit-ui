import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';

import DTAutosuggestPanel from './DTAutosuggestPanel';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../util/queryUtils';
import { dtLocationShape } from '../util/shapes';

const locationToOtp = location =>
  `${location.address}::${location.lat},${location.lon}${
    location.locationSlack ? `::${location.locationSlack}` : ''
  }`;

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

  static defaultProps = {
    className: undefined,
  };

  get location() {
    return this.context.router.getCurrentLocation();
  }

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(this.context.router, newViaPoints.map(locationToOtp));

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

  render = () => (
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
        initialViaPoints={getIntermediatePlaces(this.location.query)}
        updateViaPoints={this.updateViaPoints}
        swapOrder={this.swapEndpoints}
      />
    </div>
  );
}
