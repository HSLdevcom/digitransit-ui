import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { locationToOTP } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import {
  getPathWithEndpoints,
  isItinerarySearch,
  getPathWithEndpointObjects,
  isItinerarySearchObjects,
} from '../util/path';
import GeolocationStartButton from './visual/GeolocationStartButton';
import { startLocationWatch } from '../action/PositionActions';
import { setUseCurrent } from '../action/EndpointActions';

/**
 * Launches route search if both origin and destination are set.
 */
class DTAutosuggestPanel extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  };

  static propTypes = {
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
  };

  navigate = (url, replace) => {
    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

  value = location =>
    (location && location.address) ||
    (location && location.gps && location.ready && 'Nykyinen sijainti') ||
    '';

  class = location =>
    location && location.gps === true ? 'position' : 'location';

  geolocateButton = () =>
    !this.props.origin ||
    this.props.origin.set === false ||
    (this.props.origin.gps && !this.props.origin.ready) ? (
      <GeolocationStartButton
        onClick={() => {
          this.context.executeAction(startLocationWatch);

          this.navigate(
            getPathWithEndpointObjects(
              { gps: true, ready: false },
              this.props.destination,
            ),
            !isItinerarySearchObjects(
              { gps: true, ready: false },
              this.props.destination,
            ),
          );

          this.context.executeAction(setUseCurrent, {
            target: 'origin',
            router: this.context.router,
            location: this.context.location,
          });
        }}
      />
    ) : null;

  render = () => (
    <div className="autosuggest-panel">
      <DTEndpointAutosuggest
        id="origin"
        className={this.class(this.props.origin)}
        searchType="all"
        placeholder="give-origin"
        value={this.value(this.props.origin)}
        onLocationSelected={location => {
          const destinationString =
            (this.props.destination && locationToOTP(this.props.destination)) ||
            '-';
          const originString = locationToOTP(location);
          this.navigate(
            getPathWithEndpoints(originString, destinationString),
            !isItinerarySearch(originString, destinationString),
          );
        }}
        renderPostInput={this.geolocateButton()}
      />
      {(this.props.destination && this.props.destination.set) ||
      (this.props.origin && this.props.origin.ready) ? (
        <DTEndpointAutosuggest
          id="destination"
          searchType="endpoint"
          placeholder="give-destination"
          className={this.class(this.props.destination)}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            const destinationString = locationToOTP(location);
            const originString = locationToOTP(this.props.origin);
            this.navigate(
              getPathWithEndpoints(originString, destinationString),
              !isItinerarySearch(originString, destinationString),
            );
          }}
          autoFocus={false && this.props.destination === undefined}
        />
      ) : null}
    </div>
  );
}

export default DTAutosuggestPanel;
