import React from 'react';
import { Link } from 'react-router';

import Icon from './icon/Icon';

export default function DesktopView({ title, header, map, content }) {
  return (
    <div className="desktop">
      <div className="main-content">
        <div className="desktop-title">
          <h2>
            <Link to="/"><Icon img="icon-icon_home" className="home-icon" /></Link>
            <Icon img="icon-icon_arrow-collapse--right" className="arrow-icon" />
            {title}
          </h2>
        </div>
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
  title: React.PropTypes.node,
  header: React.PropTypes.node,
  map: React.PropTypes.node,
  content: React.PropTypes.node,
};
