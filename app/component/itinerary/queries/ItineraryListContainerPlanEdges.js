import { graphql } from 'react-relay';

export const ItineraryListContainerPlanEdges = graphql`
  fragment ItineraryListContainerPlanEdges on PlanEdge @relay(plural: true) {
    ...ItineraryListPlanEdges
    node {
      legs {
        mode
      }
    }
  }
`;
