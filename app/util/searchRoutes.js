import { graphql } from 'react-relay';

export default graphql`
  query searchRoutesQuery($feeds: [String!]!, $name: String) {
    viewer {
      routes(feeds: $feeds, name: $name) {
        gtfsId
        agency {
          name
        }
        shortName
        mode
        longName
        patterns {
          code
        }
      }
    }
  }
`;
