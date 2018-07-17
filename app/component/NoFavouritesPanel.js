import React from 'react';
import { FormattedMessage } from 'react-intl';
import { isBrowser } from '../util/browser';

const NoFavouritesPanel = () => (
  <div className="nofavs row">
    <div className="small-12 columns">
      <div className="nofavs-p black text-center">
        <div className="nofavs-img">
          {isBrowser && (
            <img
              // eslint-disable-next-line global-require
              src={require('../configurations/images/default/favourites_empty_tip.png')}
              alt="No favourites tip icon"
            />
          )}
        </div>
        <FormattedMessage
          id="no-favourites"
          defaultMessage="Use the star buttons to add routes or stops to your favorites. Your favorites are shown on this page."
        />
      </div>
    </div>
  </div>
);

export default NoFavouritesPanel;
