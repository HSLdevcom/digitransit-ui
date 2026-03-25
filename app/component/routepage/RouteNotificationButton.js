import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Icon, Question } from '@hsl-fi/icons';
import '@hsl-fi/design-tokens/css/colors.css';
import '@hsl-fi/design-tokens/css/shadows.css';
import { useTranslationsContext } from '../../util/useTranslationsContext';

function RouteNotificationButton({ notification }) {
  const intl = useTranslationsContext();
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
      <p>{content[0]}</p>
    ) : (
      <ul>
        {content.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );

  let linkHref = null;
  if (link) {
    linkHref = link.startsWith('http') ? link : `https://www.${link}`;
  }

  const buttons = [
    {
      children: intl.formatMessage({ id: 'close' }),
      variant: 'secondary',
      onClick: () => setOpen(false),
    },
    linkHref && {
      children: intl.formatMessage({ id: 'extra-info' }),
      variant: 'primary',
      href: linkHref,
      target: '_blank',
      rel: 'noreferrer',
    },
  ].filter(Boolean);

  return (
    <>
      <button
        type="button"
        className="route-notification-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span>{closeButtonLabel}</span>
        <Icon icon={Question} size="s" />
      </button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          title={closeButtonLabel}
          description={contentNode}
          lang={lang}
          buttons={buttons}
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
