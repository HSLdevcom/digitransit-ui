import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { dtLocationShape } from '../util/shapes';
import {
  getPathWithEndpointObjects,
  isItinerarySearchObjects,
} from '../util/path';
import GeolocationStartButton from './visual/GeolocationStartButton';
import { startLocationWatch } from '../action/PositionActions';

/**
 * Launches route search if both origin and destination are set.
 */
class DTAutosuggestPanel extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    breakpoint: PropTypes.string,
  };

  static propTypes = {
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    isItinerary: PropTypes.bool,
    tab: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      showDarkOverlay: false,
    };
  }

  navigate = (url, replace) => {
    if (replace && !this.props.isItinerary) {
      this.context.router.replace(url);
    } else if (this.props.isItinerary) {
      this.context.router.replace(`/reitti${url}`);
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

  currentLocationSelected = (location) => {
    if (!location.ready) {
      this.context.executeAction(startLocationWatch);
    }
  };

  isFocused = val => {
    this.setState({ showDarkOverlay: val });
  };

  render = () => (
    <div
      className={cx([
        'autosuggest-panel',
        {
          small: this.context.breakpoint !== 'large',
          isItinerary: this.props.isItinerary,
        },
      ])}
    >
      <div
        className={cx([
          'dark-overlay',
          {
            hidden: !this.state.showDarkOverlay,
          },
        ])}
      />
      <DTEndpointAutosuggest
        id="origin"
        autoFocus={
          this.context.breakpoint === 'large' && !this.props.origin.ready
        }
        refPoint={this.props.origin}
        className={this.class(this.props.origin)}
        searchType="all"
        placeholder="give-origin"
        value={this.value(this.props.origin)}
        isFocused={this.isFocused}
        onLocationSelected={location => {
          let origin = location;
          let destination = this.props.destination;
          if (location.type === 'CurrentLocation') {
	    currentLocationSelected(location);
            origin = { gps: true, ready: true };
            if (destination.gps === true) {
              // destination has gps, clear destination
              destination = { set: false };
            }
          }
          this.navigate(
            getPathWithEndpointObjects(origin, destination, this.props.tab),
            !isItinerarySearchObjects(origin, destination),
          );
        }}
      />
      {(this.props.destination && this.props.destination.set) ||
      this.props.origin.ready ||
      this.props.isItinerary ? (
        <DTEndpointAutosuggest
          id="destination"
          autoFocus={this.context.breakpoint === 'large'}
          refPoint={this.props.origin}
          searchType="endpoint"
          placeholder="give-destination"
          className="destination"
          isFocused={this.isFocused}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            let origin = this.props.origin;
            let destination = location;
            if (location.type === 'CurrentLocation') {
              currentLocationSelected(location);
              destination = { gps: true, ready: true };
              if (origin.gps === true) {
                origin = { set: false };
              }
            }
            this.navigate(
              getPathWithEndpointObjects(origin, destination, this.props.tab),
              !isItinerarySearchObjects(origin, destination),
            );
          }}
        />
      ) : null}
    </div>
  );
}

export default DTAutosuggestPanel;
