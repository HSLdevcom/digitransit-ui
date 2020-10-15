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
  // pass these to map according to bottom sheet placement
  const [bottomsheetState, changeBottomsheetState] = useState({
    context: { mapBottomPadding: 0, buttonBottomPadding: 0 },
  });
  useLayoutEffect(() => {
    if (map) {
      const paddingHeight = (window.innerHeight - topBarHeight) * 0.9; // height of .drawer-padding, defined as 90% of map height
      const newSheetPosition = paddingHeight / 2;
      scrollRef.current.scrollTop = newSheetPosition;
      changeBottomsheetState({
        context: {
          mapBottomPadding: newSheetPosition,
          buttonBottomPadding: newSheetPosition,
        },
      });
    }
  }, [header, map]);

  const onScroll = e => {
    if (map) {
      const scroll = e.target.scrollTop;
      changeBottomsheetState({
        context: { ...bottomsheetState.context, buttonBottomPadding: scroll },
      });
    }
  };

  return (
    <div className="mobile">
      {selectFromMapHeader}
      {map ? (
        <>
          <MapBottomsheetContext.Provider value={bottomsheetState.context}>
            {map}
          </MapBottomsheetContext.Provider>
          <div className="drawer-container" onScroll={onScroll} ref={scrollRef}>
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
