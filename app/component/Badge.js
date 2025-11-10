import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import capitalize from 'lodash/capitalize';
import Icon from './Icon';

const DISRUPTION_BADGE_PREFIX = 'disruption-badge-';

function variantValidator(props, propName, componentName) {
  if (
    !['info', 'success', 'warning', 'danger', 'severe'].includes(
      props[propName].toLowerCase(),
    )
  ) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to ${componentName}.`,
    );
  }
  return null;
}

const getIcon = variant => {
  switch (true) {
    case variant === 'info': {
      return <Icon img="icon_info-circled" className="info" />;
    }
    case variant === 'success': {
      return <Icon img="icon_check" className="success" />;
    }
    case variant === 'warning': {
      return <Icon img="icon_alert-circled" className="warning" />;
    }
    case ['danger', 'severe'].includes(variant): {
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
      {showIcon && getIcon(variant.toLowerCase())}
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
