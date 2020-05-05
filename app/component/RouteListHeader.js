import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

const RouteListHeader = ({ displayNextDeparture, className }) => (
  <div
    className={cx(
      'route-list-header route-stop row padding-vertical-small',
      className,
    )}
  >
    <div className="route-stop-now">
      <FormattedMessage id="right-now" defaultMessage="Right now" />
    </div>
    <div className="route-stop-name">
      <FormattedMessage id="stop" defaultMessage="Stop" />
    </div>
    <div className="route-stop-time">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
    </div>
    {displayNextDeparture ? (
      <div className="route-stop-time">
        <FormattedMessage id="next" defaultMessage="Next" />
      </div>
    ) : (
      ''
    )}
  </div>
);

RouteListHeader.propTypes = {
  className: PropTypes.string,
  displayNextDeparture: PropTypes.bool,
};

RouteListHeader.defaultProps = {
  displayNextDeparture: true,
};

export default RouteListHeader;
