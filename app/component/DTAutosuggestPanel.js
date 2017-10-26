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
  };

  constructor(props) {
    super(props);
    this.state = {
      hideDarkOverlay: false,
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
    this.setState({ hideDarkOverlay: val });
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
            hidden: !this.state.hideDarkOverlay,
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
          if (location.type === 'CurrentLocation') {
            if (this.props.destination.gps === true) {
              // destination has gps, clear destination
              this.navigate(
                getPathWithEndpointObjects(
                  { gps: true, ready: true },
                  { set: false },
                ),
                !isItinerarySearchObjects(
                  { gps: true, ready: true },
                  { set: false },
                ),
              );
              return;
            }
            this.navigate(
              getPathWithEndpointObjects(
                { gps: true, ready: true },
                this.props.destination,
              ),
            );
            return;
          }
          this.navigate(
            getPathWithEndpointObjects(location, this.props.destination),
            !isItinerarySearchObjects(location, this.props.destination),
          );
          this.setState({
            ...this.state,
            selectionDone: true,
          });
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
            if (location.type === 'CurrentLocation') {
              if (this.props.origin.gps === true) {
                // origin has current location set, clear origin
                this.navigate(
                  getPathWithEndpointObjects(
                    { set: false },
                    { gps: true, ready: true },
                  ),
                  !isItinerarySearchObjects(
                    { set: false },
                    { gps: true, ready: true },
                  ),
                );
                return;
              }
              this.navigate(
                getPathWithEndpointObjects(this.props.origin, {
                  gps: true,
                  ready: true,
                }),
              );
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
