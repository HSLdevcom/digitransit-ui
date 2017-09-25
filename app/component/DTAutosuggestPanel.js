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
    hasOrigin: PropTypes.bool.isRequired,
    hasDestination: PropTypes.bool.isRequired,
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
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <DTEndpointAutosuggest
        searchType="all"
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
            searchType="endpoint"
            value={
              (this.props.destination && this.props.destination.address) || ''
            }
            onLocationSelected={location => {
              // TODO check if origin is set!!
              const originString = locationToOTP(this.props.origin);
              const destinationString = locationToOTP(location);

              this.context.router.push(
                getPathWithEndpoints(originString, destinationString),
              );
            }}
            autoFocus={this.props.destination === undefined}
          />
        : undefined}
    </div>;
}

export default DTAutosuggestPanel;
