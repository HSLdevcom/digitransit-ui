import { graphql } from 'react-relay';

const RouteTitleFragment = graphql`
  fragment RouteTitleFragment_route on Route {
    gtfsId
    shortName
    color
    mode
    type
  }
`;

export default RouteTitleFragment;
