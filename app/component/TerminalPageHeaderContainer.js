import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopPageHeader from './StopPageHeader';

const StopPageHeaderContainer = createFragmentContainer(StopPageHeader, {
  station: graphql`
    fragment TerminalPageHeaderContainer_station on Stop {
      ...StopCardHeaderContainer_stop
    }
  `,
});

export default connectToStores(
  StopPageHeaderContainer,
  ['FavouriteStore'],
  ({ getStore }, { match }) => ({
    favourite: getStore('FavouriteStore').isFavourite(match.params.terminalId),
  }),
);
