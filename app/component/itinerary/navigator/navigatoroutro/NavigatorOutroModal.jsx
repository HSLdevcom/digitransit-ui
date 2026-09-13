import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../../util/shapes.js';
import { useLogo } from '../../../../hooks/useLogo.js';
import NavigatorModal from '../NavigatorModal.jsx';
import NavigatorOutro from './NavigatorOutro.jsx';

const NavigatorOutroModal = ({ onClose, destination }, { config }) => {
  const { logo, loading } = useLogo(config.thumbsUpGraphic);

  if (loading) {
    return null;
  }

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
