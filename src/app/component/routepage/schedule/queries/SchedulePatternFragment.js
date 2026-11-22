import { graphql } from 'react-relay';

export default graphql`
  fragment SchedulePatternFragment on Pattern {
    id
    code
    stops {
      id
      name
    }
  }
`;
