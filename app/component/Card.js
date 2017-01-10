import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const Card = ({ className, children }) => (
  <div className={cx('card', className)}>
    {children}
  </div>
);
Card.displayName = 'Card';
Card.description = () =>
  <div>
    <p>Renders a card container</p>
    <ComponentUsageExample description="">
      <Card className="padding-small">content of a card</Card>
    </ComponentUsageExample>
  </div>;

Card.displayName = 'Card';

Card.propTypes = {
  className: React.PropTypes.string,
  children: React.PropTypes.node,
};

export default Card;
