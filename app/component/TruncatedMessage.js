import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import TruncateMarkup from 'react-truncate-markup';

const TruncatedMessage = ({ lines, message, className }, { intl }) => {
  const [isTruncated, setTruncated] = useState(true);
  if (isTruncated) {
    return (
      <TruncateMarkup
        lines={lines}
        ellipsis={
          <span>
            ...{' '}
            <button
              className={className}
              type="button"
              onClick={() => {
                setTruncated(false);
              }}
            >
              {intl.formatMessage({
                id: 'show-more',
                defaultMessage: 'Show more',
              })}
            </button>{' '}
            &rsaquo;
          </span>
        }
      >
        <div>{message}</div>
      </TruncateMarkup>
    );
  }
  return message;
};

TruncatedMessage.propTypes = {
  lines: PropTypes.number.isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  className: PropTypes.string,
};

TruncatedMessage.contextTypes = {
  intl: intlShape.isRequired,
};

export default TruncatedMessage;
