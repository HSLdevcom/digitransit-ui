import { graphql } from 'react-relay';

export default graphql`
  query bikeParksQuery($ids: [String!]!) {
    vehicleParkings(ids: $ids) {
      id
      bikeParkId: vehicleParkingId
      name
      spacesAvailable: bicyclePlaces
      realtime
    }
  }
`;
