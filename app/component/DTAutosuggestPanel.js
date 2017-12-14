import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import { locationToOTP } from '../util/otpStrings';
import Icon from './Icon';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { dtLocationShape } from '../util/shapes';
import { navigateTo, PREFIX_ITINERARY_SUMMARY } from '../util/path';
import { isBrowser } from '../util/browser';

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
    isViaPoint: PropTypes.bool,
    originPlaceHolder: PropTypes.string,
    originSearchType: PropTypes.string,
    viaPointName: PropTypes.string,
    setViaPointName: PropTypes.func,
    tab: PropTypes.string,
  };

  static defaultProps = {
    originPlaceHolder: 'give-origin',
    originSearchType: 'endpoint',
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
      {
        <DTEndpointAutosuggest
          id="origin"
          autoFocus={
            // Disable autofocus if using IE11
            isBrowser && window.navigator.userAgent.indexOf('Trident') !== -1
              ? false
              : this.context.breakpoint === 'large' && !this.props.origin.ready
          }
          refPoint={this.props.origin}
          className={this.class(this.props.origin)}
          searchType={this.props.originSearchType}
          placeholder={this.props.originPlaceHolder}
          value={this.value(this.props.origin)}
          isFocused={this.isFocused}
          onLocationSelected={location => {
            let origin = { ...location, ready: true };
            let { destination } = this.props;
            if (location.type === 'CurrentLocation') {
              origin = { ...location, gps: true, ready: !!location.lat };
              if (destination.gps === true) {
                // destination has gps, clear destination
                destination = { set: false };
              }
            }
            navigateTo({
              base: this.context.location,
              origin,
              destination,
              context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
              router: this.context.router,
              tab: this.props.tab,
            });
          }}
        />
      }
      {this.props.isViaPoint && (
        <div className="viapoint-input-container">
          <div className="viapoint-before">
            <div className="viapoint-before_line-top" />
            <div className="viapoint-icon">
              <Icon img="icon-icon_place" />
            </div>
            <div className="viapoint-before_line-bottom" />
          </div>
          <DTEndpointAutosuggest
            id="viapoint"
            autoFocus={
              // Disable autofocus if using IE11
              navigator.userAgent.indexOf('Trident') !== -1
                ? false
                : this.context.breakpoint === 'large'
            }
            refPoint={this.props.origin}
            searchType="endpoint"
            placeholder="via-point"
            className="viapoint"
            isFocused={this.isFocused}
            value={this.props.viaPointName}
            onLocationSelected={item => {
              this.context.router.replace({
                ...this.context.location,
                query: {
                  ...this.context.location.query,
                  intermediatePlaces: locationToOTP({
                    lat: item.lat,
                    lon: item.lon,
                    address: item.address,
                  }),
                },
              });
              this.props.setViaPointName(item.address);
            }}
          />
        </div>
      )}
      {(this.props.destination && this.props.destination.set) ||
      this.props.origin.ready ||
      this.props.isItinerary ? (
        <DTEndpointAutosuggest
          id="destination"
          autoFocus={
            // Disable autofocus if using IE11
            navigator.userAgent.indexOf('Trident') !== -1
              ? false
              : this.context.breakpoint === 'large'
          }
          refPoint={this.props.origin}
          searchType="endpoint"
          placeholder="give-destination"
          className={this.class(this.props.destination)}
          isFocused={this.isFocused}
          value={this.value(this.props.destination)}
          onLocationSelected={location => {
            let { origin } = this.props;
            let destination = { ...location, ready: true };
            if (location.type === 'CurrentLocation') {
              destination = { ...location, gps: true, ready: !!location.lat };
              if (origin.gps === true) {
                origin = { set: false };
              }
            }
            navigateTo({
              base: this.context.location,
              origin,
              destination,
              context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
              router: this.context.router,
              tab: this.props.tab,
            });
          }}
        />
      ) : null}
    </div>
  );
}

export default DTAutosuggestPanel;
