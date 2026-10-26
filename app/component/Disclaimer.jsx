import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Note } from '@hsl-fi/notifications';
import { Text } from '@hsl-fi/layout-primitives';
import { ArrowLink } from '@hsl-fi/navigation';
import { useConfigContext } from '../hooks/ConfigContext';

const EMPTY_VALUES = {};

export default function Disclaimer({
  header,
  headerId,
  text,
  textId,
  linkLabel,
  linkLabelId,
  values = EMPTY_VALUES,
  href,
  closable,
  onClose, // hook e.g. for remembering closing
}) {
  const { language } = useConfigContext();
  const [showCard, setShowCard] = useState(true);

  if (!showCard) {
    return null;
  }

  const handleClose = () => {
    setShowCard(false);
    if (onClose) {
      onClose();
    }
  };

  const title = headerId ? (
    <FormattedMessage id={headerId} values={values} />
  ) : (
    header
  );
  const content = textId ? (
    <FormattedMessage id={textId} values={values} />
  ) : (
    text
  );
  const label = linkLabelId ? (
    <FormattedMessage id={linkLabelId} values={values} />
  ) : (
    linkLabel
  );

  // Note's link prop cannot open a new tab, so the link is part of the description
  const description = (
    <>
      {content && (
        <Text variant="text-xs" color="default">
          {content}
        </Text>
      )}
      {href && (
        <ArrowLink href={href} target="_blank" rel="noreferrer">
          {label}
        </ArrowLink>
      )}
    </>
  );

  return (
    <Note
      level="info"
      variant="note"
      title={title}
      titleLevel={3}
      description={description}
      lang={language}
      onClose={closable ? handleClose : undefined}
    />
  );
}

Disclaimer.propTypes = {
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  headerId: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  textId: PropTypes.string,
  linkLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  linkLabelId: PropTypes.string,
  values: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  ),
  href: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
};
