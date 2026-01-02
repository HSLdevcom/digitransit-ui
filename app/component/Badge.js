import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import capitalize from 'lodash/capitalize';
import Icon from './Icon';
import { AlertSeverityLevelType } from '../constants';

const DISRUPTION_BADGE_PREFIX = 'disruption-badge-';

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
      return <Icon img="icon_alert-circled" className="warning" />;
    }
    case variant === AlertSeverityLevelType.Severe: {
      return <Icon img="icon_caution_white_exclamation" className="danger" />;
    }
    default:
      return null;
  }
};

export default function Badge({
  label,
  showIcon,
  variant,
  className,
  ...rest
}) {
  return (
    <div {...rest} className={cx('badge', variant.toLowerCase(), className)}>
      {showIcon && getIcon(variant)}
      <FormattedMessage
        id={`${DISRUPTION_BADGE_PREFIX}${label.toLowerCase()}`}
        defaultMessage={capitalize(label.toLowerCase()).replace(/_/g, ' ')}
      />
    </div>
  );
}

Badge.propTypes = {
  label: PropTypes.string,
  showIcon: PropTypes.bool,
  variant: variantValidator,
  className: PropTypes.string,
};
Badge.defaultProps = {
  label: undefined,
  variant: 'info',
  showIcon: false,
  className: undefined,
};
