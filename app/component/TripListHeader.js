import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

const TripListHeader = ({ className }) => (
  <div className={cx('route-list-header route-stop row padding-vertical-small', className)}>
    <div className="columns small-3 route-stop-now">
      <FormattedMessage id="right-now" defaultMessage="Right now" />
    </div>
    <div className="columns small-7 route-stop-name">
      <FormattedMessage id="stop" defaultMessage="Stop" />
    </div>
    <div className="columns small-2 route-stop-time">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </div>

  </div>
);

TripListHeader.propTypes = {
  className: React.PropTypes.string,
};

export default TripListHeader;
