import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopCardHeaderContainer from './StopCardHeaderContainer';
import StopPageHeader from './StopPageHeader';

const StopPageHeaderContainer = Relay.createContainer(StopPageHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        ${StopCardHeaderContainer.getFragment('stop')}
      }
    `,
  },
});

export default connectToStores(
  StopPageHeaderContainer,
  ['FavouriteStore'],
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStore').isFavourite(params.stopId),
  }),
);
