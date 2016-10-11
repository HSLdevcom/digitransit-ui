import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '../icon/icon';
import IconWithCaution from '../icon/IconWithCaution';

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
      <FormattedMessage id="your-favourites" defaultMessage="Favourites" />
    </li>
  );
}

FavouritesTabLabel.propTypes = {
  hasDisruption: React.PropTypes.bool,
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
};
