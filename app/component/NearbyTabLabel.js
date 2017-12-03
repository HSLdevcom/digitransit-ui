import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

export default function NearbyTabLabel({ classes, onClick }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/click-events-have-key-events
    <li className={classes} onClick={onClick} role="button">
      <Icon className="prefix-icon nearby-icon" img="icon-icon_nearby" />
      <FormattedMessage id="near-you" defaultMessage="Near you" />
    </li>
  );
}

NearbyTabLabel.propTypes = {
  classes: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
