import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import IconWithCaution from './IconWithCaution';

export default function NearbyTabLabel({ classes, onClick }) {
  return (
    <li className={classes} onClick={onClick}>
      <Icon
        className="prefix-icon nearby-icon"
        img="icon-icon_user"
      />
    </li>
  );
}

NearbyTabLabel.propTypes = {
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
};
