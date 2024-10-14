/* eslint-disable no-unused-vars */
import Modal from '@hsl-fi/modal';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { intlShape } from 'react-intl';
import { configShape } from '../../../util/shapes';
import NavigatorIntro from './NavigatorIntro';

const NavigatorIntroModal = ({ isOpen, onPrimaryClick, onClose }, context) => {
  const { config, isLoggedIn } = context;
  const [logo, setLogo] = useState();

  useEffect(() => {
    if (!config.navigationLogo) {
      return;
    }

    const loadLogo = async () => {
      try {
        const importedLogo = await import(
          /* webpackChunkName: "main" */ `../../../configurations/images/${config.navigationLogo}`
        );
        setLogo(importedLogo.default);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading logo:', error);
      }
    };

    loadLogo();
  }, []);

  return (
    <Modal
      appElement="#app"
      isOpen={isOpen}
      className="navigator-intro-modal"
      overlayClassName="navigator-intro-modal-overlay"
    >
      <NavigatorIntro
        logo={logo}
        onPrimaryClick={onPrimaryClick}
        onClose={onClose}
        isLoggedIn={isLoggedIn}
      />
    </Modal>
  );
};

NavigatorIntroModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPrimaryClick: PropTypes.func,
};

NavigatorIntroModal.defaultProps = {
  onPrimaryClick: undefined,
};

NavigatorIntroModal.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

const NavigatorIntroModalWithStores = connectToStores(NavigatorIntro, [
  ['UserStore'],
  context => ({
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
  }),
]);

export default NavigatorIntroModal;
