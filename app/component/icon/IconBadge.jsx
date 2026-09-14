import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const isBadgeTextLong = badgeText => badgeText.length > 1 || badgeText > 9;

const IconBadge = ({ badgeFill, badgeText, textFill }) => {
  if (!badgeFill || (!badgeText && badgeText !== 0)) {
    return null;
  }

  return (
    <svg className="icon-badge" viewBox="0 0 40 40">
      <circle
        className="badge-circle"
        cx="20"
        cy="20"
        fill={badgeFill}
        r="18"
      />
      <text
        className={cx('badge-text', {
          long: isBadgeTextLong(badgeText),
        })}
        dy="0.35em"
        x="20"
        y="20"
        style={textFill ? { fill: textFill } : {}}
      >
        {badgeText}
      </text>
    </svg>
  );
};

IconBadge.propTypes = {
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textFill: PropTypes.string,
};

IconBadge.defaultProps = {
  badgeFill: undefined,
  badgeText: undefined,
  textFill: '#fff',
};

export default IconBadge;
