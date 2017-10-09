import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { locationToOTP } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import { getPathWithEndpoints, isItinerarySearch } from '../util/path';
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
    origin: dtLocationShape,
    destination: dtLocationShape,
    geolocation: PropTypes.object,
  };

  state = {}; // todo

  navigate = (url, replace) => {
    if (replace) {
      this.context.router.replace(url);
    } else {
      this.context.router.push(url);
    }
  };

  value = location =>
    (location && location.address) ||
    (location && location.gps && 'Nykyinen sijainti') ||
    '';

  class = location =>
    location && location.gps === true ? 'position' : 'location';

  render = () => (
    <div className="autosuggest-panel">
      <span style={{ position: 'relative', display: 'block' }}>
        <DTEndpointAutosuggest
          id="origin"
          className={this.class(this.props.origin)}
          searchType="all"
          placeholder="give-origin"
          value={this.value(this.props.origin)}
          onLocationSelected={location => {
            let [
              ,
              originString,
              destinationString, // eslint-disable-line prefer-const
            ] = this.context.location.pathname.split('/');
            originString = locationToOTP(location);

            this.navigate(
              getPathWithEndpoints(originString, destinationString),
              !isItinerarySearch(originString, destinationString),
            );
          }}
        />
        {this.props.origin === undefined ? (
          <GeolocationStartButton
            onClick={() => {
              this.context.executeAction(startLocationWatch);
              const destinationString = this.context.location.pathname.split(
                '/',
              )[3];

              this.navigate(
                getPathWithEndpoints('POS', destinationString),
                !isItinerarySearch('POS', destinationString),
              );

              this.context.executeAction(setUseCurrent, {
                target: 'origin',
                router: this.context.router,
                location: this.context.location,
              });
            }}
          />
        ) : null}
      </span>
      {this.props.origin !== undefined ||
      this.props.destination !== undefined ? (
        <DTEndpointAutosuggest
          id="destination"
          searchType="endpoint"
          placeholder="give-destination"
          className={this.class(this.props.destination)}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            let [
              ,
              originString, // eslint-disable-line prefer-const
              destinationString,
            ] = this.context.location.pathname.split('/');
            destinationString = locationToOTP(location);

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
