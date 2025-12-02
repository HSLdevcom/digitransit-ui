import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { configShape } from '../../../../util/shapes';
import { useLogo } from '../hooks/useLogo';
import NavigatorModal from '../NavigatorModal';
import NavigatorIntro from './NavigatorIntro';

const NavigatorIntroModal = (
  { onPrimaryClick, onClose, onOpenGeolocationInfo },
  { config },
) => {
  const { logo, loading } = useLogo(config.navigationLogo);

  if (loading) {
    return null;
  }

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

NavigatorIntroModal.defaultProps = {
  onPrimaryClick: undefined,
};

NavigatorIntroModal.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NavigatorIntroModal;
