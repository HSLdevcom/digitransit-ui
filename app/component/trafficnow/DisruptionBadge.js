import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import capitalize from 'lodash/capitalize';
import Icon from '../Icon';
import { AlertSeverityLevelType } from '../../constants';
import { DISRUPTION_BADGE_PREFIX } from '../../util/stopStatusUtils';

/**
 * Renders a styled badge pill for a GTFS-RT disruption alert in Traffic Now
 * contexts (disruption cards, canceled trip cards, disruption details).
 *
 * Use this component when an alert effect (e.g. DETOUR, SIGNIFICANT_DELAYS,
 * NO_SERVICE) is always available and you want the full badge pill with an
 * optional severity icon.
 *
 * For stop/terminal pages where the status may come from service-calendar data
 * (out-of-service, no-service-today) and may not have an alert effect, use
 * `StopScheduleStatus` instead.
 */

function variantValidator(props, propName, componentName) {
  if (!Object.values(AlertSeverityLevelType).includes(props[propName])) {
    return new Error(
      `Invalid prop \`${propName}: ${props[propName]}\` supplied to ${componentName}.`,
    );
  }
  return null;
}

const getIcon = variant => {
  switch (true) {
    case [AlertSeverityLevelType.Info, AlertSeverityLevelType.Unknown].includes(
      variant,
    ): {
      return <Icon img="icon_info-circled" className="info" />;
    }
    case variant === AlertSeverityLevelType.Warning: {
      return <Icon img="icon_caution_white_exclamation" className="warning" />;
    }
    case variant === AlertSeverityLevelType.Severe: {
      return <Icon img="icon_caution_white_exclamation" className="danger" />;
    }
    default:
      return null;
  }
};

export default function DisruptionBadge({
  label = undefined,
  showIcon = false,
  variant = 'info',
  className = undefined,
  ...rest
}) {
  return (
    <div
      {...rest}
      className={cx('badge tag-bold', variant.toLowerCase(), className)}
    >
      {showIcon && getIcon(variant)}
      <FormattedMessage
        id={`${DISRUPTION_BADGE_PREFIX}${label.toLowerCase()}`}
        defaultMessage={capitalize(label.toLowerCase()).replace(/_/g, ' ')}
      />
    </div>
  );
}

DisruptionBadge.propTypes = {
  label: PropTypes.string,
  showIcon: PropTypes.bool,
  variant: variantValidator,
  className: PropTypes.string,
};
