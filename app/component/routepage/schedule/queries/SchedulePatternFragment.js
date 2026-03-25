import { graphql } from 'react-relay';

export const SchedulePatternFragment = graphql`
  fragment SchedulePatternFragment on Pattern {
    id
    code
    stops {
      id
      name
    }
  }
`;
