import { graphql } from 'react-relay/compat';

export default graphql`
  query carParkQuery($id: String!) {
    carPark(id: $id) {
      id
      name
      maxCapacity
      spacesAvailable
      realtime
    }
  }
`;
