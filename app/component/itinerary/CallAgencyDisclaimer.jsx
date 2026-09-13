import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import { openDeepLink } from '../../util/vehicleRentalUtils';

export default function CallAgencyDisclaimer({
  textId,
  text,
  values,
  href,
  linkText,
  header,
}) {
  const onClick = href?.startsWith('http')
    ? () => {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    : () => openDeepLink(href, window.location.href);

  return (
    <div className="call-agency-disclaimer-container">
      <Icon className="info" img="icon_info" />
      <div className="disclaimer">
        {header && <h3 className="disclaimer-header">{header}</h3>}
        {text || <FormattedMessage id={textId} values={values} />}
        {href && (
          <button
            type="button"
            className="external-link-button"
            onClick={e => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            {linkText}
          </button>
        )}
      </div>
    </div>
  );
}

CallAgencyDisclaimer.propTypes = {
  textId: PropTypes.string,
  text: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  linkText: PropTypes.string,
  header: PropTypes.string,
};

CallAgencyDisclaimer.defaultProps = {
  textId: null,
  text: null,
  values: {},
  href: null,
  linkText: null,
  header: null,
};
