import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Text } from '@hsl-fi/layout-primitives';
import { ArrowLink } from '@hsl-fi/navigation';
import { useIntl } from 'react-intl';
import ThemedIcon from '../ThemedIcon';

function RouteNotificationButton({ notification }) {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const lang = intl.locale;
  const closeButtonLabel = notification.closeButtonLabel?.[lang];
  const content = notification.content?.[lang] ?? [];
  const link = notification.link?.[lang];

  if (!closeButtonLabel) {
    return null;
  }

  const contentNode =
    content.length === 1 ? (
      <Text variant="text-s">{content[0]}</Text>
    ) : (
      <ul>
        {content.map(item => (
          <li key={item}>
            <Text variant="text-s">{item}</Text>
          </li>
        ))}
      </ul>
    );

  let linkHref = null;
  if (link) {
    linkHref = link.startsWith('http') ? link : `https://www.${link}`;
  }

  const descriptionNode = (
    <>
      {contentNode}
      {linkHref && (
        <ArrowLink href={linkHref} target="_blank" rel="noreferrer">
          {intl.formatMessage({ id: 'extra-info' })}
        </ArrowLink>
      )}
    </>
  );

  return (
    <>
      <button
        type="button"
        className="route-notification-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span>{closeButtonLabel}</span>
        <ThemedIcon name="Question" />
      </button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          title={closeButtonLabel}
          description={descriptionNode}
          lang={lang}
        />
      </Modal>
    </>
  );
}

RouteNotificationButton.propTypes = {
  notification: PropTypes.shape({
    closeButtonLabel: PropTypes.objectOf(PropTypes.string),
    content: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    link: PropTypes.objectOf(PropTypes.string),
  }).isRequired,
};

export default RouteNotificationButton;
