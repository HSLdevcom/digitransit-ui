import React from 'react';
import { FormattedMessage } from 'react-intl';

const RouteListHeader = () =>
  (<div className="route-list-header route-stop row padding-vertical-small">
    <div className="columns small-3 route-stop-now">
      <FormattedMessage id="right-now" defaultMessage="Right now" />
    </div>
    <div className="columns small-5 route-stop-name">
      <FormattedMessage id="stop" defaultMessage="Stop" />
    </div>
    <div className="columns small-3 route-stop-code">
      <FormattedMessage id="stop-number" defaultMessage="Stop number" />
    </div>
    <div className="columns small-1 route-stop-mins">
      <FormattedMessage id="minutes" defaultMessage="Min" />
    </div>
  </div>);
export default RouteListHeader;
