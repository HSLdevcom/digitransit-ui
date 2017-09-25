import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, locationShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { locationToOTP } from '../util/otpStrings';
import { dtLocationShape } from '../util/shapes';

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

  render = () =>
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <DTEndpointAutosuggest
        searchType="all"
        value={(this.props.origin && this.props.origin.address) || ''}
        onLocationSelected={location => {
          const originString = locationToOTP(location);
          this.context.router.replace(`/${originString}`);
        }}
      />
      {this.props.origin !== undefined
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
                `/reitti/${originString}/${destinationString}`,
              );
            }}
            autoFocus
          />
        : undefined}
    </div>;
}

export default DTAutosuggestPanel;
