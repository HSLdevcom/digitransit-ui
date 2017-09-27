import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { locationToOTP } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';
import { getPathWithEndpoints, isItinerarySearch } from '../util/path';

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

  render = () =>
    <div className="autosuggest-panel">
      <DTEndpointAutosuggest
        id="origin"
        className="location"
        searchType="all"
        placeholder="give-origin"
        value={(this.props.origin && this.props.origin.address) || ''}
        onLocationSelected={location => {
          let [
            ,
            originString,
            destinationString,
          ] = this.context.location.pathname.split('/');
          originString = locationToOTP(location);

          this.navigate(
            getPathWithEndpoints(originString, destinationString),
            !isItinerarySearch(originString, destinationString),
          );
        }}
      />
      {this.props.origin !== undefined || this.props.destination !== undefined
        ? <DTEndpointAutosuggest
            id="destination"
            searchType="endpoint"
            placeholder="give-destination"
            className="location"
            value={
              (this.props.destination && this.props.destination.address) || ''
            }
            onLocationSelected={location => {
              let [
                ,
                originString,
                destinationString,
              ] = this.context.location.pathname.split('/');
              destinationString = locationToOTP(location);

              this.navigate(
                getPathWithEndpoints(originString, destinationString),
                !isItinerarySearch(originString, destinationString),
              );
            }}
            autoFocus={this.props.destination === undefined}
          />
        : null}
    </div>;
}

export default DTAutosuggestPanel;
