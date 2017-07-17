import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

export default function NearbyTabLabel({ classes, onClick }) {
  return (
    <li className={classes} onClick={onClick}>
      <Icon
        className="prefix-icon nearby-icon"
        img="icon-icon_nearby"
      />
      <FormattedMessage id="near-you" defaultMessage="Near you" />
    </li>
  );
}

NearbyTabLabel.propTypes = {
  classes: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
