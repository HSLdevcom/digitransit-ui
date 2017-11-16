import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { dtLocationShape } from '../util/shapes';
import { navigateTo, PREFIX_ITINERARY_SUMMARY } from '../util/path';
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

  value = location =>
    (location && location.address) ||
    (location && location.gps && location.ready && 'Nykyinen sijainti') ||
    '';

  class = location =>
    location && location.gps === true ? 'position' : 'location';

  currentLocationSelected = location => {
    if (!location.lat) {
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
          let origin = { ...location, ready: true };
          let destination = this.props.destination;
          if (location.type === 'CurrentLocation') {
            origin = { ...location, gps: true, ready: !!location.lat };
            this.currentLocationSelected(location);
            if (destination.gps === true) {
              // destination has gps, clear destination
              destination = { set: false };
            }
          }
          navigateTo({
            origin,
            destination,
            context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
            router: this.context.router,
          });
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
          className={this.class(this.props.destination)}
          isFocused={this.isFocused}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            let origin = this.props.origin;
            let destination = { ...location, ready: true };
            if (location.type === 'CurrentLocation') {
              this.currentLocationSelected(location);
              destination = { ...location, gps: true, ready: !!location.lat };
              if (origin.gps === true) {
                origin = { set: false };
              }
            }
            navigateTo({
              origin,
              destination,
              context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
              router: this.context.router,
            });
          }}
        />
      ) : null}
    </div>
  );
}

export default DTAutosuggestPanel;
