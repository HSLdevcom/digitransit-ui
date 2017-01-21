import React from 'react';
import cx from 'classnames';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const Favourite = ({ addFavourite, favourite, className }) => (
  <span className={cx('cursor-pointer favourite-icon', className)} onClick={addFavourite}>
    <Icon className={cx('favourite', { selected: favourite })} img="icon-icon_star" />
  </span>
);

Favourite.propTypes = {
  addFavourite: React.PropTypes.func.isRequired,
  favourite: React.PropTypes.bool,
  className: React.PropTypes.string,
};

Favourite.description = () =>
  <div>
    <p>
      {`This component shows whether an entity is a favourite
        and allows the user to toggle the favourite status on/off.`}
    </p>
    <ComponentUsageExample description="entity is favourite">
      <Favourite addFavourite={() => {}} favourite />
    </ComponentUsageExample>
    <ComponentUsageExample description="entity is not favourite">
      <Favourite addFavourite={() => {}} />
    </ComponentUsageExample>
  </div>;

Favourite.displayName = 'Favourite';

export default Favourite;
