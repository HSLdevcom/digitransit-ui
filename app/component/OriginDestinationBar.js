import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import { withCurrentTime } from '../util/searchUtils';
import ComponentUsageExample from './ComponentUsageExample';
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

class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    destination: dtLocationShape,
    location: PropTypes.object,
    origin: dtLocationShape,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: undefined,
    location: undefined,
  };

  get location() {
    return this.props.location || this.context.router.getCurrentLocation();
  }

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(this.context.router, newViaPoints.map(locationToOtp));

  swapEndpoints = () => {
    const { location } = this;
    const locationWithTime = withCurrentTime(this.context.getStore, location);
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
    }
    navigateTo({
      base: locationWithTime,
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
      resetIndex: true,
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

OriginDestinationBar.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with-viapoint">
      <OriginDestinationBar
        destination={{ ready: false, set: false }}
        location={{
          query: {
            intermediatePlaces: 'Opastinsilta 6, Helsinki::60.199093,24.940536',
          },
        }}
        origin={{
          address: 'Messukeskus, Itä-Pasila, Helsinki',
          lat: 60.201415,
          lon: 24.936696,
          ready: true,
          set: true,
        }}
      />
    </ComponentUsageExample>
  </React.Fragment>
);

export default OriginDestinationBar;
