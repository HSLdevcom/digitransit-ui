import { graphql } from 'react-relay';

export default graphql`
  query bikeParkQuery($id: String!) {
    bikePark(id: $id) {
      id
      name
      spacesAvailable
      realtime
    }
  }
`;
