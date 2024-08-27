import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from '../Icon';

export default function FareDisclaimer({
  textId,
  text,
  values,
  href,
  linkText,
}) {
  return (
    <div className="disclaimer-container unknown-fare-disclaimer__top">
      <div className="icon-container">
        <Icon className="info" img="icon-icon_info" />
      </div>
      <div className="description-container">
        {text || <FormattedMessage id={textId} values={values} />}
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
}
FareDisclaimer.propTypes = {
  textId: PropTypes.string,
  text: PropTypes.string, // preformatted text
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  linkText: PropTypes.string,
};

FareDisclaimer.defaultProps = {
  textId: null,
  text: null,
  values: {},
  href: null,
  linkText: null,
};
