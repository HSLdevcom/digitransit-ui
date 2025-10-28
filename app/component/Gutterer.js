import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Gutterer = ({
  children,
  className,
  leftBg,
  rightBg,
  leftGutterPadding,
  rightGutterPadding,
  maxWidth,
}) => (
  <div className={cx('gutterer', className)}>
    <div
      className="left-gutter"
      style={{ backgroundColor: leftBg, padding: leftGutterPadding }}
    />
    <div
      className="gutterer-content"
      style={
        maxWidth ? { maxWidth, margin: '0 auto', width: '100%' } : undefined
      }
    >
      {children}
    </div>
    <div
      className="right-gutter"
      style={{ backgroundColor: rightBg, padding: rightGutterPadding }}
    />
  </div>
);

Gutterer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.string,
  leftBg: PropTypes.string,
  rightBg: PropTypes.string,
  leftGutterPadding: PropTypes.string,
  rightGutterPadding: PropTypes.string,
};

Gutterer.defaultProps = {
  className: undefined,
  maxWidth: undefined,
  leftBg: 'inherit',
  rightBg: 'inherit',
  leftGutterPadding: 'inherit',
  rightGutterPadding: 'inherit',
};

export default Gutterer;
