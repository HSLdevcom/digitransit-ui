import React from 'react';
import Icon from '../icon/icon';
import IconWithCaution from '../icon/IconWithCaution';
import { FormattedMessage } from 'react-intl';

export default function NearbyTabLabel({ hasDisruption, classes, onClick }) {
  return (
    <li className={classes} onClick={onClick}>
      {hasDisruption ?
        <IconWithCaution
          className="prefix-icon nearby-icon"
          img="icon-icon_bus-withoutBox"
        /> :
        <Icon
          className="prefix-icon nearby-icon"
          img="icon-icon_bus-withoutBox"
        />}
      <FormattedMessage id="near-you" defaultMessage="Near you" />
    </li>
  );
}

NearbyTabLabel.propTypes = {
  hasDisruption: React.PropTypes.bool,
  classes: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func.isRequired,
};
