import PropTypes from 'prop-types';
import React, { useRef, useLayoutEffect, useState } from 'react';
import MapBottomsheetContext from './map/MapBottomsheetContext';

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
  const topBarHeight = 64;
  const [bottomsheetState, changeBottomsheetState] = useState({
    position: 0,
    context: { paddingBottomRight: [0, 0] },
  });
  useLayoutEffect(() => {
    if (map) {
      const paddingHeight = window.innerHeight * 0.9 - topBarHeight; // height of .drawer-padding, defined in map.scss
      const newSheetPosition = paddingHeight / 2;
      if (Math.abs(newSheetPosition - bottomsheetState.position) < 1) {
        return;
      }
      const mapHeight = window.innerHeight - topBarHeight;
      const paddingBottomRight = [0, mapHeight - mapHeight / 2];
      scrollRef.current.scrollTop = newSheetPosition;
      changeBottomsheetState({
        position: newSheetPosition,
        context: { paddingBottomRight },
      });
    }
  }, [header, map]);

  return (
    <div className="mobile">
      {selectFromMapHeader}
      {map ? (
        <>
          <MapBottomsheetContext.Provider value={bottomsheetState.context}>
            {map}
          </MapBottomsheetContext.Provider>
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
