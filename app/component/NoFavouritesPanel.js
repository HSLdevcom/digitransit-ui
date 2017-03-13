import React from 'react';
import { FormattedMessage } from 'react-intl';

//const noFavouriteImg = require('../../sass/themes/default/favourites_empty_tip'); // eslint-disable-line global-require

const NoFavouritesPanel = () => (
  <div className="row">
    <div className="small-12 columns">
      <p className="gray text-center">
      <div className="nofavs-img"></div>
      <FormattedMessage
        id="no-favourites" 
        defaultMessage="Use the star buttons to add routes or stops to your favorites. Your favorites are shown on this page."
      /></p></div></div>);


export default NoFavouritesPanel;
