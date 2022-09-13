import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

const ExternalLink = ({ msgId, href }) => (
  <div>
    <a className={cx('no-decoration', 'medium')} href={href}>
      <FormattedMessage id={msgId} defaultMessage="" />
    </a>
  </div>
);

ExternalLink.propTypes = {
  msgId: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default ExternalLink;
