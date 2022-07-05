import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

const Link = ({ msgId, href }) => (
  <div>
    <a className={cx('no-decoration', 'medium')} href={href}>
      <FormattedMessage id={msgId} defaultMessage="" />
    </a>
  </div>
);

Link.propTypes = {
  msgId: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default Link;
