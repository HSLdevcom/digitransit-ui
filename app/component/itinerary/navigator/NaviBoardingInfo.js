import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import RouteNumberContainer from '../../RouteNumberContainer';
import { routeShape } from '../../../util/shapes';
import Icon from '../../Icon';

const NaviBoardingInfo = ({
  route,
  mode,
  headsign,
  translationValues,
  withExpandIcon,
  compact,
}) => {
  return (
    <div
      className={cx({
        boarding: !compact,
        'compact-boarding': compact,
        'with-icon': withExpandIcon,
      })}
      aria-live="polite"
      role="status"
    >
      <div className="route-info">
        {withExpandIcon && (
          <Icon img="navi-expand" className="icon-expand-small" />
        )}
        <RouteNumberContainer
          className={cx('line', mode)}
          route={route}
          mode={mode}
          isTransitLeg
          vertical
          withBar
          hideText={compact}
        />
        {!compact && <div className="headsign">{headsign}</div>}
      </div>
      <FormattedMessage id="leaves">
        {msg => <span className="sr-only">{msg}</span>}
      </FormattedMessage>
      {!withExpandIcon && (
        <div className="wait-duration">
          <FormattedMessage
            id="navileg-departing-at"
            defaultMessage="{duration} min päästä klo {legTime}"
            values={translationValues}
          />
        </div>
      )}
    </div>
  );
};

NaviBoardingInfo.propTypes = {
  route: routeShape.isRequired,
  mode: PropTypes.string.isRequired,
  headsign: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  translationValues: PropTypes.object.isRequired,
  withExpandIcon: PropTypes.bool,
  compact: PropTypes.bool,
};
NaviBoardingInfo.defaultProps = {
  withExpandIcon: false,
  compact: false,
};

export default NaviBoardingInfo;
