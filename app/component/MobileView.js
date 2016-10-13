import React from 'react';

export default function MobileView({ header, map, content }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
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
