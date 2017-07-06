import {
  ApolloClient,
  createNetworkInterface,
  IntrospectionFragmentMatcher,
} from 'react-apollo';

let options = { };

// TODO: fix this
if (typeof window !== 'undefined') {
  const config = window.state.context.plugins['extra-context-plugin'].config;

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: {
      __schema: {
        types: [
          {
            kind: 'INTERFACE',
            name: 'Node',
            possibleTypes: [
              {
                name: 'Agency',
              },
              {
                name: 'Route',
              },
              {
                name: 'Pattern',
              },
              {
                name: 'Trip',
              },
              {
                name: 'Stop',
              },
              {
                name: 'Cluster',
              },
              {
                name: 'stopAtDistance',
              },
              {
                name: 'Alert',
              },
              {
                name: 'TicketType',
              },
              {
                name: 'placeAtDistance',
              },
              {
                name: 'DepartureRow',
              },
              {
                name: 'BikeRentalStation',
              },
              {
                name: 'BikePark',
              },
              {
                name: 'CarPark',
              },
            ],
          },
          {
            kind: 'INTERFACE',
            name: 'PlaceInterface',
            possibleTypes: [
              {
                name: 'Stop',
              },
              {
                name: 'DepartureRow',
              },
              {
                name: 'BikeRentalStation',
              },
              {
                name: 'BikePark',
              },
              {
                name: 'CarPark',
              },
            ],
          },
        ],
      },
    },
  });

  const networkInterface = createNetworkInterface({
    uri: `${config.URL.OTP}index/graphql`,
  });

  options = {
    networkInterface,
    dataIdFromObject: o => o.id,
    fragmentMatcher,
  };
}

export default new ApolloClient(options);
