import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { stylesShape } from '../util/shapes';

const Gutterer = ({
  children,
  className,
  containerStyles,
  leftGutterStyles,
  rightGutterStyles,
  contentStyles,
  maxWidth,
}) => {
  const contentStylesWithMaxWidth = {
    ...contentStyles,
    maxWidth,
    margin: maxWidth ? '0 auto' : undefined,
    width: maxWidth ? '100%' : undefined,
  };

  return (
    <div className={cx('gutterer', className)} style={containerStyles}>
      <div className="left-gutter" style={leftGutterStyles} />
      <div className="gutterer-content" style={contentStylesWithMaxWidth}>
        {children}
      </div>
      <div className="right-gutter" style={rightGutterStyles} />
    </div>
  );
};

Gutterer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxWidth: PropTypes.string.isRequired,
  containerStyles: stylesShape,
  leftGutterStyles: stylesShape,
  rightGutterStyles: stylesShape,
  contentStyles: stylesShape,
};

Gutterer.defaultProps = {
  className: undefined,
  containerStyles: {},
  leftGutterStyles: {},
  rightGutterStyles: {},
  contentStyles: {},
};

export default Gutterer;
