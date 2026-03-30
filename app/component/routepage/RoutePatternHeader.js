import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import { useTranslationsContext } from '../../util/useTranslationsContext';

function RoutePatternHeader({
  origin,
  destination,
  backgroundColor = null,
  canSwap = false,
  onSwap = undefined,
}) {
  const intl = useTranslationsContext();

  return (
    <div
      className={`route-pattern-header${
        canSwap ? '' : ' route-pattern-header--no-swap'
      }`}
      style={backgroundColor ? { background: backgroundColor } : undefined}
    >
      <div className="route-pattern-endpoint">
        <Icon
          className="route-pattern-header-icon route-pattern-origin-icon"
          img="icon_origin-ellipse"
          viewBox="0 0 16 16"
          color={backgroundColor}
        />
        <span className="route-pattern-location-name">{origin}</span>
      </div>
      <div className="route-pattern-connector">
        <div className="route-pattern-dots">
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
          />
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
          />
          <Icon
            className="route-pattern-dot"
            img="icon_small-circle"
            viewBox="0 0 2 2"
          />
        </div>
        <hr className="route-pattern-divider" />
      </div>
      <div className="route-pattern-endpoint">
        <Icon
          className="route-pattern-header-icon route-pattern-destination-icon"
          img="icon_mapMarker"
          viewBox="0 0 16 24"
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
          <Icon img="icon_direction-c" viewBox="0 0 19 17" />
        </button>
      )}
    </div>
  );
}

RoutePatternHeader.propTypes = {
  origin: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  canSwap: PropTypes.bool,
  onSwap: PropTypes.func,
};

export default RoutePatternHeader;
