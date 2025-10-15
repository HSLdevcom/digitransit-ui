import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from './Icon';

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
      return <Icon img="icon_info_filled" className="info" />;
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
      {label}
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
