import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

function Icon(props) {
  return (
    <span aria-hidden>
      <svg
        id={props.id}
        style={{
          fill: props.color ? props.color : null,
          pointerEvents: props.pointerEvents ? 'auto' : 'none',
        }}
        viewBox={props.viewBox}
        className={cx('icon', props.className)}
      >
        <use xlinkHref={`#${props.img}`} />
      </svg>
    </span>
  );
}

Icon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
  pointerEvents: PropTypes.bool,
  viewBox: PropTypes.string,
};

Icon.defaultProps = {
  className: undefined,
  color: undefined,
  id: undefined,
  pointerEvents: false,
  viewBox: '0 0 40 40',
};

const iconBadge = (badgeFill, badgeText) => {
  if (!badgeFill || !badgeText) {
    return '';
  }
  return `
  <svg 
    viewBox="0 0 40 40"
    class="icon-badge"
  >
    <circle cx="20" cy="20" fill="${badgeFill}" r="20"/>
    <text dy="0.1em" x="20" y="20">${badgeText}</text>
  </svg>`;
};

Icon.asString = (
  img,
  className,
  id,
  badgeFill = undefined,
  badgeText = undefined,
) => `
  <span>
    <svg
      ${id ? ` id=${id}` : ''}
      viewBox="0 0 40 40"
      class="${cx('icon', className)}"
    >
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${img}"/>
    </svg>
    ${iconBadge(badgeFill, badgeText)}
  </span>
`;

Icon.displayName = 'Icon';
Icon.description = 'Shows an icon from the SVG sprite';
export default Icon;
