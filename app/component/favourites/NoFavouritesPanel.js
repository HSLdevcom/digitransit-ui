import React from 'react';
import { FormattedMessage } from 'react-intl';

const NoFavouritesPanel = () => (
  <div className="row">
    <div className="small-12 columns">
      <p className="gray text-center"><FormattedMessage
        id="no-favourites"
        defaultMessage="You can add favourite routes by clicking 'Star-buttons'
        found around the application. After that, you'll see a list of favourite routes here."
      /></p></div></div>);


export default NoFavouritesPanel;
