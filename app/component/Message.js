import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function Message({ labelId, defaultMessage }) {
  if (labelId) {
    return <FormattedMessage id={labelId} defaultMessage={defaultMessage} />;
  }
  if (defaultMessage) {
    return <span> {defaultMessage} </span>;
  }
  return null;
}

Message.propTypes = {
  labelId: PropTypes.string,
  defaultMessage: PropTypes.string,
};

Message.defaultProps = {
  labelId: undefined,
  defaultMessage: undefined,
};
