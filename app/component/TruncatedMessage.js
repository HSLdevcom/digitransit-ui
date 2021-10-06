import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import TruncateMarkup from 'react-truncate-markup';

const TruncatedMessage = (
  { lines, message, className, truncate, onShowMore, onTruncate = () => {} },
  { intl },
) => {
  const [isTruncated, setTruncated] = useState(true);

  useEffect(() => {
    setTruncated(truncate);
  }, [truncate]);

  if (isTruncated) {
    return (
      <TruncateMarkup
        lines={lines}
        onTruncate={didTruncate => onTruncate(!didTruncate)}
        ellipsis={
          <span>
            ...{' '}
            <button
              className={className}
              type="button"
              onClick={e => {
                e.preventDefault();
                setTruncated(false);
                onShowMore();
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
  message: PropTypes.object.isRequired,
  className: PropTypes.string,
  truncate: PropTypes.bool,
  unTruncate: PropTypes.func,
};

TruncatedMessage.contextTypes = {
  intl: intlShape.isRequired,
};

export default TruncatedMessage;
