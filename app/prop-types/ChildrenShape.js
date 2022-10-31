import PropTypes from 'prop-types';

const ChildrenShape = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);

export default ChildrenShape;
