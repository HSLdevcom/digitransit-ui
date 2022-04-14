import { graphql } from 'react-relay';

export default graphql`
  query carParkQuery($id: String!) {
    carPark(id: $id) {
      id
      carParkId
      name
      maxCapacity
      spacesAvailable
      realtime
    }
  }
`;
