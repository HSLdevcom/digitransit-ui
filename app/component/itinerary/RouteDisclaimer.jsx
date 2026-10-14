import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const EMPTY_VALUES = {};

export default function RouteDisclaimer({
  textId,
  text,
  values = EMPTY_VALUES,
  href,
  linkText,
  header,
}) {
  return (
    <div className="route-disclaimer-container">
      <div className="icon-container">
        <Icon className="info" img="icon_info" />
      </div>
      <div className="disclaimer">
        {header && <h3 className="info-header">{header}</h3>}
        {text || <FormattedMessage id={textId} values={values} />}
        {href && (
          <a
            onClick={e => {
              e.stopPropagation();
            }}
            className="external-link"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {linkText}
            <Icon img="icon_external-link-box" omitViewBox />
          </a>
        )}
      </div>
    </div>
  );
}
RouteDisclaimer.propTypes = {
  textId: PropTypes.string,
  text: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  linkText: PropTypes.string,
  header: PropTypes.string,
};
