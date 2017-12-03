import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import IconWithCaution from './IconWithCaution';

export default function FavouritesTabLabel({
  hasDisruption,
  classes,
  onClick,
}) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events
    <li className={classes} onClick={onClick} role="button">
      {hasDisruption ? (
        <IconWithCaution
          className="prefix-icon favourites-icon"
          img="icon-icon_star"
        />
      ) : (
        <Icon className="prefix-icon favourites-icon" img="icon-icon_star" />
      )}
      <FormattedMessage id="your-favourites" defaultMessage="Favourites" />
    </li>
  );
}

FavouritesTabLabel.propTypes = {
  hasDisruption: PropTypes.bool,
  classes: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
