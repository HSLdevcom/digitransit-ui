import PropTypes from 'prop-types';
import React from 'react';
import getAssetUrl from '../../../../assets/assetUrl';
import NavigatorModal from '../NavigatorModal';
import NaviGeolocationInfo from './NaviGeolocationInfo';
import { useConfigContext } from '../../../../hooks/ConfigContext';

export default function NaviGeolocationInfoModal({ onClose }) {
  const config = useConfigContext();
  const logo = getAssetUrl(config.naviGeolocationGraphic);

  return (
    <NavigatorModal isOpen withBackdrop slideUp>
      <NaviGeolocationInfo logo={logo} onClose={onClose} />
    </NavigatorModal>
  );
}

NaviGeolocationInfoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
