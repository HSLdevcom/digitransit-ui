import { graphql } from 'react-relay';

const PatternRedirectorFragment = graphql`
  fragment PatternRedirectorFragment_route on Route
  @argumentDefinitions(date: { type: "String" }) {
    patterns {
      code
      trips: tripsForDate(serviceDate: $date) {
        gtfsId
      }
    }
  }
`;

export default PatternRedirectorFragment;
