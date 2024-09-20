import PropTypes from 'prop-types';
import React, { useRef, useLayoutEffect } from 'react';
import { configShape } from '../util/shapes';
import MobileFooter from './MobileFooter';

const BOTTOM_SHEET_OFFSET = 20;
const topBarHeight = 64;

function getMiddlePosition() {
  return Math.floor((window.innerHeight - topBarHeight) * 0.45);
}

function slowlyScrollTo(el, done) {
  const element = el;
  const to = BOTTOM_SHEET_OFFSET;
  const duration = 500;
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
    } else {
      done();
    }
  };

  animateScroll();
}

Math.easeInOutQuad = function easeInOutQuad(a, b, c, d) {
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
  selectFromMapHeader,
  expandMap,
  searchBox,
  mapRef,
}) {
  if (settingsDrawer) {
    return <div className="mobile">{settingsDrawer}</div>;
  }
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(false);

  useLayoutEffect(() => {
    if (map) {
      const newSheetPosition = getMiddlePosition();
      scrollRef.current.scrollTop = newSheetPosition;
      mapRef?.current?.setBottomPadding(newSheetPosition);
    }
  }, [header]);

  useLayoutEffect(() => {
    if (map && expandMap) {
      if (expandMap.position === 'bottom') {
        autoScrollRef.current = true;
        slowlyScrollTo(scrollRef.current, () => {
          autoScrollRef.current = false;
          mapRef?.current?.setBottomPadding(BOTTOM_SHEET_OFFSET);
        });
      } else {
        const newSheetPosition = getMiddlePosition();
        scrollRef.current.scrollTop = newSheetPosition;
        mapRef?.current?.setBottomPadding(newSheetPosition);
      }
    }
  }, [expandMap]);

  const onScroll = e => {
    if (
      map &&
      !autoScrollRef.current &&
      e.target.className === 'drawer-container'
    ) {
      const scroll = Math.min(
        e.target.scrollTop,
        window.innerHeight - topBarHeight,
      );
      mapRef?.current?.setBottomPadding(scroll);
    }
  };

  return (
    <div className="mobile">
      {selectFromMapHeader}
      {searchBox}
      {map ? (
        <>
          {map}
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
        <div role="main" className="mobile-main-container">
          <div className="mobile-main-content-container">
            {header}
            {content}
          </div>

          <MobileFooter />
        </div>
      )}
    </div>
  );
}

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
  settingsDrawer: PropTypes.node,
  selectFromMapHeader: PropTypes.node,
  searchBox: PropTypes.node,
  expandMap: PropTypes.objectOf(PropTypes.string),
  mapRef: PropTypes.shape({ current: PropTypes.node }),
};

MobileView.defaultProps = {
  header: undefined,
  map: undefined,
  content: undefined,
  settingsDrawer: undefined,
  selectFromMapHeader: undefined,
  searchBox: undefined,
  expandMap: undefined,
  mapRef: undefined,
};

MobileView.contextTypes = {
  config: configShape.isRequired,
};
