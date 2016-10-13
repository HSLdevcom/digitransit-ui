import React from 'react';

export default function DesktopView({ header, map, content }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
      }}
    >
      <div
        style={{
          width: 600,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {header}
        {content}
      </div>
      <div
        style={{
          width: 'calc(100% - 600px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {map}
      </div>
    </div>
  );
}

DesktopView.propTypes = {
  header: React.PropTypes.node,
  map: React.PropTypes.node,
  content: React.PropTypes.node,
};
