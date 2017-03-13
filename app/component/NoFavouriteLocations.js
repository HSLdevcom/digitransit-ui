import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';

const NoFavouriteLocations = () => (
  <div id="no-favourites-container" className="border-bottom">
    <EmptyFavouriteLocationSlot index={0} />
    <div id="no-favourites-container-text">
      <FormattedMessage
        id="no-favourite-locations"
        defaultMessage="Nothing here to see."
      />
    </div>
  </div>
);

NoFavouriteLocations.displayName = 'NoFavouriteLocations';


NoFavouriteLocations.description = () =>
  <div>
    <p>Display usage hint for users with no favourites saved
    </p>
    <ComponentUsageExample>
      <NoFavouriteLocations />
    </ComponentUsageExample>
  </div>;


export default NoFavouriteLocations;
