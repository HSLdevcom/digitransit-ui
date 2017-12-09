import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopCardHeaderContainer from './StopCardHeaderContainer'; // eslint-disable-line no-unused-vars
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
  ({ getStore }, { params }) => ({
    favourite: getStore('FavouriteStopsStore').isFavourite(params.stopId),
  }),
);
