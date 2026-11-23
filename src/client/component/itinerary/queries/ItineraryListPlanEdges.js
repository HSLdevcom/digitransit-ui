import { graphql } from 'react-relay';

export const ItineraryListPlanEdges = graphql`
  fragment ItineraryListPlanEdges on PlanEdge @relay(plural: true) {
    node {
      ...ItineraryFragment
      emissionsPerPerson {
        co2
      }
      legs {
        transitLeg
        mode
        route {
          mode
          type
        }
      }
    }
  }
`;
