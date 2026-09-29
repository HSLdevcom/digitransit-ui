import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../../../utils/client/shapes';
import getAssetUrl from '../../../../client/assetUrl';
import NavigatorModal from '../NavigatorModal';
import NavigatorOutro from './NavigatorOutro';

const NavigatorOutroModal = ({ onClose, destination }, { config }) => {
  const logo = getAssetUrl(config.thumbsUpGraphic);

  return (
    <NavigatorModal isOpen withBackdrop slideUp>
      <NavigatorOutro logo={logo} onClose={onClose} destination={destination} />
    </NavigatorModal>
  );
};

NavigatorOutroModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  destination: PropTypes.string.isRequired,
};

NavigatorOutroModal.contextTypes = {
  config: configShape.isRequired,
};

export default NavigatorOutroModal;
