import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import Icon from '../Icon';

function RoutePatternHeader({
  origin,
  destination,
  iconColor = null,
  canSwap = false,
  onSwap = undefined,
}) {
  const intl = useIntl();

  return (
    <div
      className={cx('route-pattern-header', {
        'route-pattern-header--no-swap': !canSwap,
      })}
    >
      <div className="route-pattern-endpoint">
        <Icon
          className="route-pattern-header-icon route-pattern-origin-icon"
          img="icon_origin-ellipse"
          viewBox="0 0 16 16"
          color={iconColor}
        />
        <span className="route-pattern-location-name">{origin}</span>
      </div>
      <div className="route-pattern-connector">
        <div className="route-pattern-dots">
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
            color={iconColor}
          />
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
            color={iconColor}
          />
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
            color={iconColor}
          />
        </div>
        <hr className="route-pattern-divider" role="presentation" />
      </div>
      <div className="route-pattern-endpoint">
        <Icon
          className="route-pattern-header-icon route-pattern-destination-icon"
          img="icon_mapMarker"
          viewBox="0 0 16 24"
          color={iconColor}
        />
        <span className="route-pattern-location-name">{destination}</span>
      </div>
      {canSwap && (
        <button
          className="route-pattern-swap-button"
          type="button"
          onClick={onSwap}
          aria-label={intl.formatMessage({ id: 'swap-order-button-label' })}
          title={intl.formatMessage({ id: 'route-pattern-swap-tooltip' })}
        >
          <Icon img="icon_direction-c" viewBox="0 0 19 17" color="#333" />
        </button>
      )}
    </div>
  );
}

RoutePatternHeader.propTypes = {
  origin: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  canSwap: PropTypes.bool,
  onSwap: PropTypes.func,
};

export default RoutePatternHeader;
