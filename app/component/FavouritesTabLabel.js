import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import IconWithCaution from './IconWithCaution';

export default function FavouritesTabLabel({
  alertSeverityLevel,
  classes,
  onClick,
}) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events
    <li className={classes} onClick={onClick} role="button">
      {alertSeverityLevel ? (
        <IconWithCaution
          alertSeverityLevel={alertSeverityLevel}
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
  alertSeverityLevel: PropTypes.string,
  classes: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

FavouritesTabLabel.defaultProps = {
  alertSeverityLevel: undefined,
};
