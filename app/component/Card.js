import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

export default function Card({ className, children }) {
  return <div className={cx('card', className)}>{children}</div>;
}

Card.displayName = 'Card';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Card.defaultProps = { className: undefined };
