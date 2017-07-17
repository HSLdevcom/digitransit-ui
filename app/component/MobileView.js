import PropTypes from 'prop-types';
import React from 'react';

export default function MobileView({ header, map, content }) {
  return (
    <div className="mobile">
      {header}
      {map}
      {content}
    </div>
  );
}

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
};
