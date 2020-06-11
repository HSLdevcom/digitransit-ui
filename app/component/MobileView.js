import PropTypes from 'prop-types';
import React from 'react';

export default function MobileView({
  header,
  map,
  content,
  settingsDrawer,
  selectFromMapHeader,
}) {
  if (settingsDrawer && settingsDrawer.props.open) {
    return <div className="mobile">{settingsDrawer}</div>;
  }
  return (
    <div className="mobile">
      {selectFromMapHeader}
      {map}
      {header}
      {content}
    </div>
  );
}

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.any,
  content: PropTypes.node,
  settingsDrawer: PropTypes.node,
  selectFromMapHeader: PropTypes.node,
};
