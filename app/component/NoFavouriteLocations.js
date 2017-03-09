import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';

const NoFavouriteLocations = () => (
  <div id="no-favourites-container">
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


export default NoFavouriteLocations;
