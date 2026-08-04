import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { useIntl } from 'react-intl';
import { useRouter } from 'found';
import { useConfigContext } from '../configurations/ConfigContext';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { getLoginPath } from '../util/path';

export default function LoginPrompt({
  open,
  onClose,
  titleId = 'login-header',
  descriptionId = 'login-content',
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { match } = useRouter();

  const login = intl.formatMessage({
    id: 'login',
    defaultMessage: 'Log in',
  });
  const cancel = intl.formatMessage({
    id: 'cancel',
    defaultMessage: 'cancel',
  });
  const title = intl.formatMessage({
    id: titleId,
    defaultMessage: 'Log in first',
  });
  const description = intl.formatMessage({ id: descriptionId });

  const handlePrimaryClick = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'login',
      name: null,
    });
    window.location.assign(getLoginPath(match.location));
  };

  const handleSecondaryClick = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'login cancelled',
      name: null,
    });
    onClose();
  };

  return (
    <Modal
      lang={config.language}
      onOpenChange={handleSecondaryClick}
      open={open}
    >
      <ModalContent
        title={title}
        description={description}
        lang={config.language}
        buttons={[
          {
            children: login,
            onClick: handlePrimaryClick,
          },
          {
            children: cancel,
            onClick: handleSecondaryClick,
            variant: 'secondary',
          },
        ]}
      />
    </Modal>
  );
}

LoginPrompt.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  titleId: PropTypes.string,
  descriptionId: PropTypes.string,
};
