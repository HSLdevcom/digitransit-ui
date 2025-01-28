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
}) => {
  return (
    <div className={cx('boarding', { 'with-icon': withExpandIcon })}>
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
        />
        <div className="headsign">{headsign}</div>
      </div>
      <div className="wait-duration">
        <FormattedMessage
          id="navileg-departing-at"
          defaultMessage="{duration} min päästä klo {legTime}"
          values={translationValues}
        />
      </div>
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
};
NaviBoardingInfo.defaultProps = {
  withExpandIcon: false,
};

export default NaviBoardingInfo;
