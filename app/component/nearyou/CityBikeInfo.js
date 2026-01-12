import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../../util/shapes';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { getReadMessageIds, setReadMessageIds } from '../../store/localStorage';
import {
  getRentalNetworkConfig,
  getRentalNetworkId,
} from '../../util/vehicleRentalUtils';
import Icon from '../Icon';

const CityBikeInfo = ({ lang }, { config }) => {
  const [showCityBikeTeaser, setShowCityBikeTeaser] = useState(
    !getReadMessageIds().includes('citybike_teaser'),
  );

  const handleClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push('citybike_teaser');
    setReadMessageIds(readMessageIds);
    setShowCityBikeTeaser(false);
  };

  const { vehicleRental } = config;
  // Use buy instructions if available
  const { buyUrl } = vehicleRental;
  const buyInstructions = buyUrl && vehicleRental.buyInstructions?.[lang];

  // Use general information about using city bike, if one network config is available
  const networkUrl =
    Object.keys(vehicleRental.networks).length === 1 &&
    getRentalNetworkConfig(
      getRentalNetworkId(Object.keys(vehicleRental.networks)),
      config,
    ).url;

  if (!showCityBikeTeaser || !(buyUrl || networkUrl)) {
    return null;
  }
  return (
    <div className="citybike-use-disclaimer">
      <div className="disclaimer-header">
        <FormattedMessage id="citybike-start-using" />
        <div
          className="disclaimer-close"
          aria-label="Sulje kaupunkipyöräoikeuden ostaminen"
          tabIndex="0"
          onKeyDown={e => {
            if (
              isKeyboardSelectionEvent(e) &&
              (e.keyCode === 13 || e.keyCode === 32)
            ) {
              handleClose();
            }
          }}
          onClick={handleClose}
          role="button"
        >
          <Icon color={config.colors.primary} img="icon_close" />
        </div>
      </div>
      <div className="disclaimer-content">
        {buyInstructions || (
          <a
            className="external-link-citybike"
            href={networkUrl[lang]}
            target="_blank"
            rel="noreferrer"
          >
            <FormattedMessage id="citybike-start-using-info" />
          </a>
        )}
        {buyUrl && (
          <a
            href={buyUrl[lang]}
            target="_blank"
            rel="noreferrer"
            className="disclaimer-close-button-container"
            tabIndex="0"
            role="button"
            onKeyDown={e => {
              if (
                isKeyboardSelectionEvent(e) &&
                (e.keyCode === 13 || e.keyCode === 32)
              ) {
                window.location = buyUrl[lang];
              }
            }}
          >
            <div
              aria-label="Siirry ostamaan kaupunkipyöräoikeutta."
              className="disclaimer-close-button"
            >
              <FormattedMessage id="buy" />
            </div>
          </a>
        )}
      </div>
    </div>
  );
};

CityBikeInfo.propTypes = { lang: PropTypes.string.isRequired };

CityBikeInfo.contextTypes = { config: configShape.isRequired };

export default CityBikeInfo;
