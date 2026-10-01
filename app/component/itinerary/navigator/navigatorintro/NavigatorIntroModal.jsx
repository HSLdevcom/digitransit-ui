import PropTypes from 'prop-types';
import React from 'react';
import getAssetUrl from '../../../../assets/assetUrl';
import NavigatorModal from '../NavigatorModal';
import NavigatorIntro from './NavigatorIntro';
import { useConfigContext } from '../../../../client/ConfigContext';

const NavigatorIntroModal = ({
  onPrimaryClick,
  onClose,
  onOpenGeolocationInfo,
}) => {
  const config = useConfigContext();
  const logo = getAssetUrl(config.navigationLogo);

  return (
    <NavigatorModal isOpen withBackdrop slideUp>
      <NavigatorIntro
        logo={logo}
        onPrimaryClick={onPrimaryClick}
        onClose={onClose}
        onOpenGeolocationInfo={onOpenGeolocationInfo}
      />
    </NavigatorModal>
  );
};

NavigatorIntroModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
  onOpenGeolocationInfo: PropTypes.func.isRequired,
};

export default NavigatorIntroModal;
