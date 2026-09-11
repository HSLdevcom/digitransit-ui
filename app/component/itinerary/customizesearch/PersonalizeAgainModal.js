import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { RadioGroup } from '@hsl-fi/form';
import { Text } from '@hsl-fi/layout-primitives';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useFavouriteActions } from '../../../hooks/FavouriteContext';

export default function PersonalizeAgainModal({ open, onClose, onContinue }) {
  const intl = useIntl();
  const config = useConfigContext();
  const { savePersonalizationPreferences } = useFavouriteActions();
  const [action, setAction] = useState();

  const ok = intl.formatMessage({ id: 'continue' });
  const cancel = intl.formatMessage({ id: 'cancel' });
  const title = intl.formatMessage({ id: 'personalization-continue-query' });
  const description = intl.formatMessage({
    id: 'personalization-continue-choices',
  });
  const select = intl.formatMessage({ id: 'choose' });
  const keep = intl.formatMessage({ id: 'personalization-history-keep' });
  const remove = intl.formatMessage({ id: 'personalization-history-remove' });

  const handlePrimaryClick = () => {
    if (action === 'remove') {
      savePersonalizationPreferences({ weights: {} });
    }
    onContinue();
  };

  return (
    <Modal lang={config.language} onOpenChange={onClose} open={open}>
      <ModalContent
        title={title}
        description={<Text variant="text-s">{description}</Text>}
        lang={config.language}
        buttons={[
          {
            children: ok,
            disabled: !action,
            onClick: handlePrimaryClick,
          },
          {
            children: cancel,
            onClick: onClose,
            variant: 'secondary',
          },
        ]}
      >
        <RadioGroup
          backgroundColor="primary"
          borderVariant="none"
          label={select}
          items={[
            {
              isChecked: action === 'keep',
              id: 'keep',
              key: 'keep',
              label: keep,
              onChange: () => setAction('keep'),
            },
            {
              isChecked: action === 'remove',
              id: 'remove',
              key: 'remove',
              label: remove,
              onChange: () => setAction('remove'),
            },
          ]}
        />
      </ModalContent>
    </Modal>
  );
}

PersonalizeAgainModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};
