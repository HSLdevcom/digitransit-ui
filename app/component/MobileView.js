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
  header: React.PropTypes.node,
  map: React.PropTypes.node,
  content: React.PropTypes.node,
};
