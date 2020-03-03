import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopPageHeader from './StopPageHeader';

const StopPageHeaderContainer = createFragmentContainer(StopPageHeader, {
  stop: graphql`
    fragment StopPageHeaderContainer_stop on Stop {
      ...StopCardHeaderContainer_stop
    }
  `,
});

export default connectToStores(
  StopPageHeaderContainer,
  ['FavouriteStopsStore'],
  ({ getStore }, { match }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(match.params.stopId),
  }),
);
