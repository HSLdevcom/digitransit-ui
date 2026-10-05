import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { FlexColumn, FlexRow, Text } from '@hsl-fi/layout-primitives';
import { useConfigContext } from '../client/ConfigContext';
import Icon from './Icon';

const CAPACITY_LEGEND = [
  ['icon_MANY_SEATS_AVAILABLE', 'capacity-modal.many-seats-available'],
  ['icon_FEW_SEATS_AVAILABLE', 'capacity-modal.few-seats-available'],
  ['icon_STANDING_ROOM_ONLY', 'capacity-modal.standing-room-only'],
  [
    'icon_CRUSHED_STANDING_ROOM_ONLY',
    'capacity-modal.crushed-standing-room-only',
  ],
];

export default function CapacityModal({ onClose }) {
  const intl = useIntl();
  const config = useConfigContext();

  return (
    <Modal lang={config.language} open onOpenChange={onClose}>
      <ModalContent
        title={intl.formatMessage({ id: 'capacity-modal.heading' })}
        description={intl.formatMessage({ id: 'capacity-modal.subheading' })}
        lang={config.language}
      >
        <FlexColumn gap="s">
          <Text variant="heading-xs">
            {intl.formatMessage({ id: 'capacity-modal.legend' })}
          </Text>
          {CAPACITY_LEGEND.map(([icon, messageId]) => (
            <FlexRow key={icon} alignItems="center" gap="s">
              <Icon
                img={icon}
                width={1.5}
                height={1.5}
                color={config.colors.primary}
              />
              <Text variant="text-s" color="default">
                {intl.formatMessage({ id: messageId })}
              </Text>
            </FlexRow>
          ))}
        </FlexColumn>
      </ModalContent>
    </Modal>
  );
}

CapacityModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};
