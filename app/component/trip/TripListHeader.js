import React from 'react';
import { FormattedMessage } from 'react-intl';

const RouteListHeader = () =>
  (<div className="route-list-header route-stop row padding-vertical-small">
    <div className="columns small-3 route-stop-now">
      <FormattedMessage id="right-now" defaultMessage="Right now" />
    </div>
    <div className="columns route-stop-now-reverse" />
    <div className="columns small-7 route-stop-name">
      <FormattedMessage id="stop" defaultMessage="Stop" />
    </div>
    <div className="columns small-2 route-stop-time">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </div>

  </div>);
export default RouteListHeader;
