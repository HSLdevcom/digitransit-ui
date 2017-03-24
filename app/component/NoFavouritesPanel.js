import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoFavouritesPanel = () => (
  <div className="nofavs row">
    <div className="small-12 columns">
      <p className="nofavs-p black text-center">
        <div className="nofavs-img" />
        <FormattedMessage
          id="no-favourites"
          defaultMessage="Use the star buttons to add routes or stops to your favorites. Your favorites are shown on this page."
        />
      </p>
    </div>
  </div>
);


export default NoFavouritesPanel;
