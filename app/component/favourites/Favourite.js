import React from 'react';
import Icon from '../icon/icon';
import cx from 'classnames';

const Favourite = ({ addFavourite, favourite }) => (
  <span className="cursor-pointer favourite-icon right" onClick={addFavourite}>
    <Icon className={cx('favourite', { selected: favourite })} img="icon-icon_star" />
  </span>);

Favourite.propTypes = {
  addFavourite: React.PropTypes.func.isRequired,
  favourite: React.PropTypes.bool.isRequired,
};

export default Favourite;
