import { graphql } from 'react-relay';

export default graphql`
  query AlertsQuery($feedIds: [String!]) {
    alerts(feeds: $feedIds) {
      id
      ...DisruptionCardFragment_alert
    }
  }
`;
