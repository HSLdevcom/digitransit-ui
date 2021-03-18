import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import Truncate from 'react-truncate';

const TruncatedMessage = ({ lines, message, className }, { intl }) => {
  const [isTruncated, setTruncated] = useState(true);
  return (
    <Truncate
      lines={isTruncated ? lines : -1}
      trimWhitespace
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
      {message}
    </Truncate>
  );
};

TruncatedMessage.propTypes = {
  lines: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

TruncatedMessage.contextTypes = {
  intl: intlShape.isRequired,
};

export default TruncatedMessage;
