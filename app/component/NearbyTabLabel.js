import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

export default function NearbyTabLabel({ classes, onClick, showLabel }) {
  return (
    <li className={classes} onClick={onClick}>
      <Icon
        className="prefix-icon nearby-icon"
        img="icon-icon_nearby"
      />
      {showLabel ?
        <span className="label">
          <FormattedMessage id="near-you" defaultMessage="Near you" />
        </span> :
        null
      }
    </li>
  );
}

NearbyTabLabel.propTypes = {
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
  showLabel: React.PropTypes.bool.isRequired,
};
