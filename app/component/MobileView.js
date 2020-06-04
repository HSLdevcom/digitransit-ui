import PropTypes from 'prop-types';
import React from 'react';

export default function MobileView({ header, map, content, settingsDrawer }) {
  if (settingsDrawer && settingsDrawer.props.open) {
    return <div className="mobile">{settingsDrawer}</div>;
  }
  return (
    <div className="mobile">
      {map}
      {header}
      {content}
    </div>
  );
}

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
  settingsDrawer: PropTypes.node,
};
