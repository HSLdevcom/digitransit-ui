import React from 'react';
import PropTypes from 'prop-types';

const Loading = props => (
  <div className="spinner-loader">{(props && props.children) || null}</div>
);

Loading.displayName = 'Loading';
Loading.propTypes = {
  children: PropTypes.node,
};

export default Loading;
