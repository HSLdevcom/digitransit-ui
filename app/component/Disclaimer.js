import React, { useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { configShape } from '../util/shapes';
import Icon from './Icon';
import { useDeepLink } from '../util/vehicleRentalUtils';

export default function Disclaimer(
  {
    header,
    headerId,
    text,
    textId,
    linkLabel,
    linkLabelId,
    values,
    href,
    useLinkButton,
    closable,
    onClose, // hook e.g. for remembering closing
  },
  { config, intl },
) {
  const [showCard, setShowCard] = useState(true);

  const handleClose = () => {
    setShowCard(false);
    if (onClose) {
      onClose();
    }
  };

  const onClick = href?.startsWith('http')
    ? () => {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    : () => useDeepLink(href, window.location.href);

  if (!showCard) {
    return null;
  }
  const hdr = headerId ? (
    <FormattedMessage id={headerId} values={values} />
  ) : (
    header
  );
  const txt = textId ? <FormattedMessage id={textId} values={values} /> : text;
  const label = linkLabelId ? (
    <FormattedMessage id={linkLabelId} values={values} />
  ) : (
    linkLabel
  );

  return (
    <div className="disclaimer-container">
      <Icon className="info" img="icon_info" />
      <div className="disclaimer">
        <div className="disclaimer-header">
          {hdr && <h3 className="disclaimer-header-text">{hdr}</h3>}
          {closable && (
            <button
              className="disclaimer-close"
              aria-label={intl.formatMessage({ id: 'close' })}
              onClick={handleClose}
              type="button"
            >
              <Icon color={config.colors.primary} img="icon_close" />
            </button>
          )}
        </div>
        {txt}
        {href && useLinkButton && (
          <button
            type="button"
            className="external-link-button"
            onClick={e => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            {label}
          </button>
        )}
        {href && !useLinkButton && (
          <a
            className="external-link"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {label}
            <Icon className="arrow" img="icon_arrow-collapse--right" />
          </a>
        )}
      </div>
    </div>
  );
}

Disclaimer.propTypes = {
  header: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  headerId: PropTypes.string,
  text: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  textId: PropTypes.string,
  linkLabel: PropTypes.oneOf(PropTypes.string, PropTypes.node),
  linkLabelId: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  useLinkButton: PropTypes.bool,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
};

Disclaimer.defaultProps = {
  header: null,
  headerId: undefined,
  text: null,
  textId: undefined,
  linkLabel: null,
  linkLabelId: undefined,
  values: {},
  href: undefined,
  useLinkButton: false,
  closable: false,
  onClose: undefined,
};

Disclaimer.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
