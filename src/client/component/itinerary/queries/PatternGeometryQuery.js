import { graphql } from 'react-relay';

export const patternGeometryQuery = graphql`
  query PatternGeometryQuery($code: String!) {
    pattern(id: $code) {
      code
      geometry {
        lat
        lon
      }
      stops {
        gtfsId
        lat
        lon
        name
        code
        platformCode
      }
    }
  }
`;
