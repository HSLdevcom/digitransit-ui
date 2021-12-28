import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const Card = ({ className, children }) => (
  <div className={cx('card', className)}>{children}</div>
);
Card.displayName = 'Card';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Card;
