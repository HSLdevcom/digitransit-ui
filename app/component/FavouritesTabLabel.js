import React from 'react';
import Icon from './Icon';
import IconWithCaution from './IconWithCaution';

export default function FavouritesTabLabel({ hasDisruption, classes, onClick }) {
  return (
    <li className={classes} onClick={onClick}>
      {hasDisruption ?
        <IconWithCaution
          className="prefix-icon favourites-icon"
          img="icon-icon_star"
        /> :
          <Icon
            className="prefix-icon favourites-icon"
            img="icon-icon_star"
          />}
    </li>
  );
}

FavouritesTabLabel.propTypes = {
  hasDisruption: React.PropTypes.bool,
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
};
