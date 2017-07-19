import Relay from 'react-relay';
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
  ['FavouriteStopsStore'],
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  }),
);
