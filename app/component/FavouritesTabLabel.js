import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import IconWithCaution from './IconWithCaution';

export default function FavouritesTabLabel({ hasDisruption, classes, onClick, showLabel }) {
  return (
    <li className={classes} onClick={onClick}>
      <span className="label">
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
      </span>
    </li>
  );
}

FavouritesTabLabel.propTypes = {
  hasDisruption: React.PropTypes.bool,
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
  showLabel: React.PropTypes.bool,
};
