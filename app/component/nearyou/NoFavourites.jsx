import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import getAssetUrl from '../../assets/assetUrl';

// Shown both when the user has no saved favourites and when all of the
// saved stop/station/citybike favourites no longer resolve (e.g. a citybike
// station whose operator has discontinued the service).
function NoFavourites({ breakpoint = undefined }) {
  return (
    <div className="no-favourites-container">
      {breakpoint !== 'large' && (
        <div className="no-favourites-header">
          <FormattedMessage id="nearest-favourites" />
        </div>
      )}
      <div className="no-favourites-content">
        <FormattedMessage id="nearest-favourites-no-favourites" />
      </div>
      <img
        className="instruction-image"
        src={getAssetUrl(
          breakpoint === 'large'
            ? 'default/nearby-stop_desktop-animation.gif'
            : 'default/nearby-stop_animation.gif',
        )}
        alt="Käyttöohje"
      />
      <FormattedMessage id="nearest-favourites-browse-stops" />
    </div>
  );
}

NoFavourites.propTypes = {
  breakpoint: PropTypes.string,
};

export default NoFavourites;
