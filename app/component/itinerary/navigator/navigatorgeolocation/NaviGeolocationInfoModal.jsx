import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../../util/shapes.js';
import { useLogo } from '../../../../hooks/useLogo.js';
import NavigatorModal from '../NavigatorModal.jsx';
import NaviGeolocationInfo from './NaviGeolocationInfo.jsx';

const NaviGeolocationInfoModal = ({ onClose }, { config }) => {
  const { logo, loading } = useLogo(config.naviGeolocationGraphic);

  if (loading) {
    return null;
  }

  return (
    <NavigatorModal isOpen withBackdrop slideUp>
      <NaviGeolocationInfo logo={logo} onClose={onClose} />
    </NavigatorModal>
  );
};

NaviGeolocationInfoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

NaviGeolocationInfoModal.contextTypes = {
  config: configShape.isRequired,
};

export default NaviGeolocationInfoModal;
