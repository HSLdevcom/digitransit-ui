import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const Favourite = ({ addFavourite, favourite, className }) => (
  <span
    className={cx('cursor-pointer favourite-icon', className)}
    onClick={addFavourite}
  >
    <Icon
      className={cx('favourite', { selected: favourite })}
      img="icon-icon_star"
      pointerEvents
    />
  </span>
);

Favourite.propTypes = {
  addFavourite: PropTypes.func.isRequired,
  favourite: PropTypes.bool,
  className: PropTypes.string,
};

Favourite.description = () => (
  <div>
    <p>
      {`This component shows whether an entity is a favourite
        and allows the user to toggle the favourite status on/off.`}
    </p>
    <ComponentUsageExample description="entity is favourite">
      <Favourite addFavourite={() => {}} favourite pointerEvents />
    </ComponentUsageExample>
    <ComponentUsageExample description="entity is not favourite">
      <Favourite addFavourite={() => {}} pointerEvents />
    </ComponentUsageExample>
  </div>
);

Favourite.displayName = 'Favourite';

export default Favourite;
