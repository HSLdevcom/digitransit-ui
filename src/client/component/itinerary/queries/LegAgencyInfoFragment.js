import { graphql } from 'react-relay';

export const LegAgencyInfoFragment = graphql`
  fragment LegAgencyInfoFragment on Leg {
    agency {
      name
      url
      fareUrl
    }
  }
`;
