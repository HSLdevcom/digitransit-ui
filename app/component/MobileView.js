import PropTypes from 'prop-types';
import React, { useRef, useLayoutEffect } from 'react';

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
  const scrollRef = useRef(null);
  const bottomsheetPosition = useRef({ default: null });
  useLayoutEffect(() => {
    if (map) {
      const sheetPaddingHeight = window.innerHeight * 0.9 - 64; // defined in map.scss
      bottomsheetPosition.current.default = sheetPaddingHeight / 2;
      scrollRef.current.scrollTop = bottomsheetPosition.current.default;
    }
  }, [header, map]);

  return (
    <div className="mobile">
      {selectFromMapHeader}
      {map ? (
        <>
          {map}
          <div className="drawer-container" ref={scrollRef}>
            <div className="drawer-padding" />
            <div className="drawer-content">
              <div className="drag-line" />
              {header}
              {content}
            </div>
          </div>
        </>
      ) : (
        <>
          {header}
          {content}
        </>
      )}
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
