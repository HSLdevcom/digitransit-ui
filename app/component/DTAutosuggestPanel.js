import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { dtLocationShape } from '../util/shapes';
import {
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
          console.log('starting location watch...');
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
          });
        }}
      />
    ) : null;

  render = () => (
    <div className="autosuggest-panel">
      <DTEndpointAutosuggest
        id="origin"
        refPoint={this.props.origin}
        className={this.class(this.props.origin)}
        searchType="all"
        placeholder="give-origin"
        value={this.value(this.props.origin)}
        onLocationSelected={location => {
          if (location.type === 'CurrentLocation') {
            if (this.props.destination.gps === true) {
              this.navigate(
                getPathWithEndpointObjects(
                  { gps: true, ready: false },
                  { set: false },
                ),
                !isItinerarySearchObjects(
                  { gps: true, ready: false },
                  { set: false },
                ),
              );
              return;
            }
            console.log('TODO!!');
            return;
          }
          this.navigate(
            getPathWithEndpointObjects(location, this.props.destination),
            !isItinerarySearchObjects(location, this.props.destination),
          );
        }}
        renderPostInput={this.geolocateButton()}
      />
      {(this.props.destination && this.props.destination.set) ||
      (this.props.origin && this.props.origin.ready) ? (
        <DTEndpointAutosuggest
          id="destination"
          refPoint={this.props.origin}
          searchType="endpoint"
          placeholder="give-destination"
          className={this.class(this.props.destination)}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            if (location.type === 'CurrentLocation') {
              if (this.props.origin.gps === true) {
                this.navigate(
                  getPathWithEndpointObjects(
                    { set: false },
                    { gps: true, ready: false },
                  ),
                  !isItinerarySearchObjects(
                    { set: false },
                    { gps: true, ready: false },
                  ),
                );
                return;
              }
              console.log('TODO!!');
              return;
            }
            this.navigate(
              getPathWithEndpointObjects(this.props.origin, location),
              !isItinerarySearchObjects(this.props.origin, location),
            );
          }}
        />
      ) : null}
    </div>
  );
}

export default DTAutosuggestPanel;
