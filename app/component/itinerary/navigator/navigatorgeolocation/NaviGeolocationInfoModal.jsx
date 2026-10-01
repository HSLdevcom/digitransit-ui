import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../../../utils/client/shapes';
import getAssetUrl from '../../../../assets/assetUrl';
import NavigatorModal from '../NavigatorModal';
import NaviGeolocationInfo from './NaviGeolocationInfo';

const NaviGeolocationInfoModal = ({ onClose }, { config }) => {
  const logo = getAssetUrl(config.naviGeolocationGraphic);

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
