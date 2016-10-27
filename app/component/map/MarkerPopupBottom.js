import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from '../icon/Icon';
import { setEndpoint } from '../../action/EndpointActions';

function MarkerPopupBottom({ location }, { executeAction }) {
  const routeFrom = () =>
    executeAction(setEndpoint, {
      target: 'origin',
      endpoint: location,
    });

  const routeTo = () =>
    executeAction(setEndpoint, {
      target: 'destination',
      endpoint: location,
    });

  return (
    <div className="bottom location">
      <div onClick={routeFrom} className="route cursor-pointer">
        <Icon img="icon-icon_route" />
        <FormattedMessage id="route-from-here" defaultMessage="Route from here" />
      </div>
      <div onClick={routeTo} className="route cursor-pointer">
        <Icon img="icon-icon_route" />
        <FormattedMessage id="route-here" defaultMessage="Route to here" />
      </div>
    </div>);
}

MarkerPopupBottom.displayName = 'MarkerPopupBottom';

MarkerPopupBottom.propTypes = {
  location: React.PropTypes.object.isRequired,
};

MarkerPopupBottom.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default MarkerPopupBottom;
