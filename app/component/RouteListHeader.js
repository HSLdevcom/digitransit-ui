import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

const RouteListHeader = ({ className }) => (
  <div className={cx('route-list-header route-stop row padding-vertical-small', className)}>
    <div className="columns route-stop-now">
      <FormattedMessage id="right-now" defaultMessage="Right now" />
    </div>
    <div className="columns route-stop-name">
      <FormattedMessage id="stop" defaultMessage="Stop" />
    </div>
    <div className="columns route-stop-time">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </div>
    <div className="columns route-stop-time">
      <FormattedMessage id="next" defaultMessage="Next" />
    </div>
  </div>
);


RouteListHeader.propTypes = {
  className: React.PropTypes.string,
};

export default RouteListHeader;
