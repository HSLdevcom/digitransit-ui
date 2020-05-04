import React from 'react';
import { FormattedMessage } from 'react-intl';
import { isBrowser } from '../util/browser';
import Icon from './Icon';

const NoFavouritesPanel = () => (
  <div className="nofavs row">
    <div className="small-12 columns">
      <div className="nofavs-p black text-center">
        <div className="nofavs-img">
          {isBrowser && (
            <Icon className="no-favourites-icon" img="icon-icon_star" />
          )}
        </div>
        <FormattedMessage
          id="no-favourites"
          defaultMessage="Use star button to add routes to your favorites. Your favorite routes are shown on this page."
        />
      </div>
    </div>
  </div>
);

export default NoFavouritesPanel;
