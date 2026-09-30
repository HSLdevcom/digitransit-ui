import PropTypes from 'prop-types';
import React from 'react';
import getAssetUrl from '../../../../client/assetUrl';
import NavigatorModal from '../NavigatorModal';
import NavigatorOutro from './NavigatorOutro';
import { useConfigContext } from '../../../../client/ConfigContext';

const NavigatorOutroModal = ({ onClose, destination }) => {
  const config = useConfigContext();
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

export default NavigatorOutroModal;
