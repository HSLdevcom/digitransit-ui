import { graphql } from 'react-relay/compat';

export default graphql`
  query searchRoutesQuery($name: String) {
    viewer {
      routes(name: $name) {
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
