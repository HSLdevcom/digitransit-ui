import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ children }) => (
  <div className="spinner-loader">{children || null}</div>
);

Loading.displayName = 'Loading';
Loading.propTypes = {
  children: PropTypes.node,
};
Loading.defaultProps = {
  children: null,
};

export default Loading;
