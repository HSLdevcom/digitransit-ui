import React from 'react';

export default function DesktopView({ header, map, content }) {
  return (
    <div className="desktop">
      <div className="main-content">
        {header}
        {content}
      </div>
      <div className="map-content">
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
