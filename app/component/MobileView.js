import PropTypes from 'prop-types';
import React, { useRef, useLayoutEffect, useState } from 'react';
import MapBottomsheetContext from './map/MapBottomsheetContext';

function slowlyScrollTo(el, to = 0, duration = 1000) {
  const element = el;
  const start = element.scrollTop;
  const change = to - start;
  const increment = 20;
  let currentTime = 0;

  const animateScroll = () => {
    currentTime += increment;

    const val = Math.easeInOutQuad(currentTime, start, change, duration);

    element.scrollTop = val;

    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };

  animateScroll();
}

Math.easeInOutQuad = function (a, b, c, d) {
  let t = a;
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t -= 1;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export default function MobileView({
  header,
  map,
  content,
  settingsDrawer,
  carpoolDrawer,
  selectFromMapHeader,
  expandMap,
  searchBox,
}) {
  if (settingsDrawer && settingsDrawer.props.open) {
    return <div className="mobile">{settingsDrawer}</div>;
  }
  if (carpoolDrawer && carpoolDrawer.props.open) {
    return <div className="mobile">{carpoolDrawer}</div>;
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
  }, [header]);

  useLayoutEffect(() => {
    if (map && expandMap) {
      const newSheetPosition = 0;
      slowlyScrollTo(scrollRef.current);
      changeBottomsheetState({
        context: {
          mapBottomPadding: newSheetPosition,
          buttonBottomPadding: newSheetPosition,
        },
      });
    }
  }, [expandMap]);

  const onScroll = e => {
    if (map) {
      if (e.target.className === 'drawer-container') {
        const scroll = e.target.scrollTop;
        changeBottomsheetState({
          context: { ...bottomsheetState.context, buttonBottomPadding: scroll },
        });
      }
    }
  };

  return (
    <div className="mobile">
      {selectFromMapHeader}
      {searchBox && <span>{searchBox}</span>}
      {map ? (
        <>
          <MapBottomsheetContext.Provider value={bottomsheetState.context}>
            {map}
          </MapBottomsheetContext.Provider>
          <div
            className="drawer-container"
            onScroll={onScroll}
            ref={scrollRef}
            role="main"
          >
            <div className="drawer-padding" />
            <div className="drawer-content">
              <div className="drag-line" />
              <div className="content-container">
                {header}
                {content}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div role="main">
          {header}
          {content}
        </div>
      )}
    </div>
  );
}

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.any,
  content: PropTypes.node,
  settingsDrawer: PropTypes.node,
  carpoolDrawer: PropTypes.node,
  selectFromMapHeader: PropTypes.node,
  searchBox: PropTypes.node,
  expandMap: PropTypes.number,
};
