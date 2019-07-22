import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const isBadgeTextLong = badgeText => badgeText.length > 1 || badgeText > 9;

const IconBadge = ({ badgeFill, badgeText }) => {
  if (!badgeFill || !badgeText) {
    return null;
  }
  return (
    <svg className="icon-badge" viewBox="0 0 40 40">
      <circle
        className="badge-circle"
        cx="20"
        cy="20"
        fill={badgeFill}
        r="20"
      />
      <text
        className={cx('badge-text', {
          long: isBadgeTextLong(badgeText),
        })}
        dy="0.3em"
        x="20"
        y="20"
      >
        {badgeText}
      </text>
    </svg>
  );
};

IconBadge.propTypes = {
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

IconBadge.defaultProps = {
  badgeFill: undefined,
  badgeText: undefined,
};

IconBadge.asString = (badgeFill, badgeText) => {
  if (!badgeFill || !badgeText) {
    return '';
  }
  return `
  <svg class="icon-badge" viewBox="0 0 40 40">
    <circle class="badge-circle" cx="20" cy="20" fill="${badgeFill}" r="20"/>
    <text class="${cx('badge-text', {
      long: isBadgeTextLong(badgeText),
    })}" dy="0.3em" x="20" y="20">${badgeText}</text>
  </svg>`;
};

function Icon({
  backgroundShape,
  badgeFill,
  badgeText,
  className,
  color,
  height,
  id,
  img,
  omitViewBox,
  viewBox,
  width,
  dataURI,
}) {
  return (
    <span aria-hidden className="icon-container">
      <svg
        id={id}
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
        }}
        viewBox={!omitViewBox ? viewBox : null}
        className={cx('icon', className)}
      >
        {backgroundShape === 'circle' && (
          <circle className="icon-circle" cx="20" cy="20" fill="white" r="20" />
        )}
        {!dataURI && <use xlinkHref={`#${img}`} />}
        {dataURI && (
          <image href={dataURI} x={0} y={0} width="100%" height="100%" />
        )}
      </svg>
      <IconBadge badgeFill={badgeFill} badgeText={badgeText} />
    </span>
  );
}

Icon.propTypes = {
  backgroundShape: PropTypes.oneOf(['circle']),
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
  omitViewBox: PropTypes.bool,
  viewBox: PropTypes.string,
  width: PropTypes.number,
  dataURI: PropTypes.string,
};

Icon.defaultProps = {
  backgroundShape: undefined,
  badgeFill: undefined,
  badgeText: undefined,
  className: undefined,
  color: undefined,
  height: undefined,
  id: undefined,
  omitViewBox: false,
  viewBox: '0 0 40 40',
  width: undefined,
};

Icon.asString = ({
  img,
  className,
  id,
  badgeFill = undefined,
  badgeText = undefined,
  backgroundShape = undefined,
}) => `
  <span class="icon-container">
    <svg
      ${id ? ` id=${id}` : ''}
      viewBox="0 0 40 40"
      class="${cx('icon', className)}"
    >
      ${
        backgroundShape === 'circle'
          ? '<circle className="icon-circle" cx="20" cy="20" fill="white" r="20" />'
          : ''
      }
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${img}"/>
    </svg>
    ${IconBadge.asString(badgeFill, badgeText)}
  </span>
`;

Icon.displayName = 'Icon';
Icon.description = 'Shows an icon from the SVG sprite';
export default Icon;
