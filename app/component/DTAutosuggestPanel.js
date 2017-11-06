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
    tab: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showDarkOverlay: false,
    };
  }

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
              this.props.tab,
            ),
            !isItinerarySearchObjects(
              { gps: true, ready: false },
              this.props.destination,
            ),
          );
        }}
      />
    ) : null;

  isFocused = val => {
    this.setState({ showDarkOverlay: val });
  };

  render = () => (
    <div
      className={cx([
        'autosuggest-panel',
        {
          small: this.context.breakpoint !== 'large',
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
          this.context.breakpoint === 'large' && !this.state.selectionDone
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
            origin = { ...location, gps: true, ready: true };
            if (destination.gps === true) {
              // destination has gps, clear destination
              destination = { set: false };
            }
          }
          this.navigate(
            getPathWithEndpointObjects(location, destination, this.props.tab),
            !isItinerarySearchObjects(origin, destination),
          );
        }}
        renderPostInput={this.geolocateButton()}
      />
      {(this.props.destination && this.props.destination.set) ||
      this.props.origin.ready ? (
        <DTEndpointAutosuggest
          id="destination"
          autoFocus={
            this.context.breakpoint === 'large' && this.state.selectionDone
          }
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
              destination = { ...destination, gps: true, ready: true };
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
