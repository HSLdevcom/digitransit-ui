import React from 'react';
import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import { doRouteSearch } from '../util/searchUtils';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';

/**
 * Launches route search if both origin and destination are set.
 */
class DTAutosuggestPanel extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    hasOrigin: PropTypes.bool.isRequired,
    hasDestination: PropTypes.bool.isRequired,
    origin: PropTypes.object,
    destination: PropTypes.object,
    geolocation: PropTypes.object,
  };

  state = {}; // todo

  render = () => {
    if (this.props.hasOrigin === true && this.props.hasDestination === true) {
      try {
        doRouteSearch(
          this.context.router,
          this.props.origin,
          this.props.destination,
          this.props.geolocation,
          false,
        );
        return null;
      } catch (Error) {
        console.log('Error doing routing:', Error);
      }
    }

    return (
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <DTEndpointAutosuggest target="origin" searchType="all" />
        {this.props.hasOrigin || this.props.hasDestination
          ? <DTEndpointAutosuggest
              target="destination"
              searchType="endpoint"
              autoFocus
            />
          : undefined}
      </div>
    );
  };
}

export default connectToStores(
  DTAutosuggestPanel,
  ['EndpointStore', 'PositionStore'],
  context => ({
    hasOrigin: context.getStore('EndpointStore').isOriginSet(),
    hasDestination: context.getStore('EndpointStore').isDestinationSet(),
    origin: context.getStore('EndpointStore').getOrigin(),
    destination: context.getStore('EndpointStore').getDestination(),
    geolocation: context.getStore('PositionStore').getLocationState(),
  }),
);
