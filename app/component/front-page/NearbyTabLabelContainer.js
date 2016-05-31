import React from 'react';
import Relay from 'react-relay';
import mapProps from 'recompose/mapProps';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';
import flatten from 'lodash/flatten';
import config from '../../config';
import NearbyTabLabel from './NearbyTabLabel';
import StopListRoute from '../../route/StopListRoute';

const STOP_COUNT = 20;

const hasDisruption = (stops) =>
  some(flatten(stops.stopsByRadius.edges.map(edge =>
    edge.node.stop.routes.map(route =>
      route.alerts.length > 0))));


const alertReducer = mapProps(({ stops, ...rest }) => ({
  hasDisruption: hasDisruption(stops),
  ...rest,
}));

const NearbyTabLabelRelayConnector = Relay.createContainer(alertReducer(NearbyTabLabel), {
  fragments: {
    stops: () => Relay.QL`
    fragment on QueryType {
        stopsByRadius(
          lat: $lat,
          lon: $lon,
          radius: $radius,
          agency: $agency,
          first: $numberOfStops
        ) {
          edges {
            node {
              distance
              stop {
                routes {
                  alerts {
                    id
                  }
                }
              }
            }
          }
        }
      }
 `,
  },

  initialVariables: {
    lat: null,
    lon: null,
    radius: config.nearbyRoutes.radius,
    numberOfStops: STOP_COUNT,
    agency: config.preferredAgency,
    currentTime: '0',
  },
});

function NearbyTabLabelContainer(props) {
  if (typeof window !== 'undefined') {
    return (
      <Relay.RootContainer
        Component={NearbyTabLabelRelayConnector}
        renderFetched={(data) =>
          <NearbyTabLabelRelayConnector {...data} {...props} />
        }
        route={new StopListRoute({
          lat: props.location.lat,
          lon: props.location.lon,
          date: props.currentTime,
        })}
        renderLoading={() =>
          <NearbyTabLabel {...props} />
        }
      />);
  }
  return <div />;
}

NearbyTabLabelContainer.propTypes = {
  location: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
};

export default connectToStores(
  NearbyTabLabelContainer,
  ['EndpointStore'],
  (context) => {
    const position = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();

    return {
      location: origin.useCurrentPosition ? position : origin,
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    };
  }
);
