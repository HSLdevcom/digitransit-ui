import { graphql } from 'react-relay';

export const StopTimetablePageFragment = graphql`
  fragment StopTimetablePageFragment on Stop
  @argumentDefinitions(date: { type: "String" }) {
    url
    ...TimetableFragment @arguments(date: $date)
  }
`;
