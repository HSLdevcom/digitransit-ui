import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Button, Text } from '@hsl-fi/layout-primitives';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function LocationModal({
  handleClose,
  startGeolocation,
  showGeolocationButton,
  showInfo,
  children = null,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  // The location search's mobile view (digitransit-component-autosuggest's
  // MobileView) renders its own full-screen react-modal, portaled directly
  // to document.body outside of this Radix-based dialog's DOM subtree.
  // A modal Radix Dialog sets document.body's pointer-events to "none" and
  // only re-enables it on its own content node, and treats any pointerdown
  // outside its content as a request to dismiss. Both of these break clicks
  // on that separate mobile search portal, so we explicitly ignore outside
  // pointerdowns that originate from it (pointer-events are restored for
  // it in nearyou.scss).
  const ignoreMobileSearchOutsidePointerDown = event => {
    if (event.target.closest?.('[class*="mobile-modal"]')) {
      event.preventDefault();
    }
  };

  return (
    <Modal lang={config.language} onOpenChange={handleClose} open>
      <ModalContent
        title={intl.formatMessage({ id: 'stop-near-you-modal-header' })}
        lang={config.language}
        className="location-modal-content"
        onPointerDownOutside={ignoreMobileSearchOutsidePointerDown}
      >
        <Text variant="text-s">
          {intl.formatMessage({ id: 'stop-near-you-modal-info' })}
        </Text>
        <Text variant="label">{intl.formatMessage({ id: 'origin' })}</Text>
        {children}
        <Text variant="label">
          {intl.formatMessage({ id: 'stop-near-you-modal-grant-permission' })}
        </Text>
        {showGeolocationButton && (
          <Button
            type="submit"
            variant="primary"
            expand
            onClick={startGeolocation}
          >
            {intl.formatMessage({ id: 'use-own-position' })}
          </Button>
        )}
        {showInfo && (
          <Text variant="text-s">
            {intl.formatMessage({
              id: 'stop-near-you-modal-grant-permission-info',
            })}
          </Text>
        )}
      </ModalContent>
    </Modal>
  );
}

LocationModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  startGeolocation: PropTypes.func.isRequired,
  showGeolocationButton: PropTypes.bool.isRequired,
  showInfo: PropTypes.bool.isRequired,
  children: PropTypes.node,
};
