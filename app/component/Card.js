import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import cx from 'classnames';

const Card = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div ref={ref} className={cx('card', className)} {...rest}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Card.defaultProps = { className: undefined };

export default Card;
