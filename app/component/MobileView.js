import PropTypes from 'prop-types';
import React, {
  useRef,
  useLayoutEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import MapBottomsheetContext from './map/MapBottomsheetContext';
import MobileFooter from './MobileFooter';

const BOTTOM_SHEET_OFFSET = 20;
const topBarHeight = 64;

function getMiddlePosition() {
  return Math.floor((window.innerHeight - topBarHeight) * 0.45);
}

function slowlyScrollTo(el, to, done) {
  const element = el;
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

const MobileView = forwardRef(
  (
    {
      header,
      map,
      content,
      settingsDrawer,
      selectFromMapHeader,
      mapRef,
      searchBox,
    },
    ref,
  ) => {
    if (settingsDrawer) {
      return <div className="mobile">{settingsDrawer}</div>;
    }
    const scrollRef = useRef(null);

    // pass these to map according to bottom sheet placement
    const [bottomPadding, setBottomPadding] = useState(getMiddlePosition());

    const onScroll = e => {
      if (e.target.className === 'drawer-container') {
        mapRef?.setBottomPadding(e.target.scrollTop);
        setBottomPadding(e.target.scrollTop);
      }
    };

    const changeBottomPadding = (padding, slowly) => {
      if (slowly) {
        slowlyScrollTo(scrollRef.current, padding, () => {
          mapRef?.forceRefresh();
          mapRef?.setBottomPadding(padding);
          setBottomPadding(padding);
        });
      } else {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = padding;
        }
        mapRef?.setBottomPadding(padding);
        setBottomPadding(padding);
      }
    };

    useImperativeHandle(ref, () => ({
      setBottomSheet: (pos, slowly) => {
        const pad =
          pos === 'middle' ? getMiddlePosition() : BOTTOM_SHEET_OFFSET;
        changeBottomPadding(pad, slowly);
      },
    }));

    useLayoutEffect(() => {
      if (map) {
        changeBottomPadding(getMiddlePosition());
      }
    }, [header]);

    useLayoutEffect(() => {
      if (map) {
        changeBottomPadding(getMiddlePosition());
      }
    }, []);

    return (
      <div className="mobile">
        {selectFromMapHeader}
        {searchBox}
        {map ? (
          <>
            <MapBottomsheetContext.Provider value={bottomPadding}>
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
  },
);

MobileView.propTypes = {
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
  settingsDrawer: PropTypes.node,
  selectFromMapHeader: PropTypes.node,
  searchBox: PropTypes.node,
  // eslint-disable-next-line
  mapRef: PropTypes.object,
};

MobileView.defaultProps = {
  header: undefined,
  map: undefined,
  content: undefined,
  settingsDrawer: undefined,
  selectFromMapHeader: undefined,
  searchBox: undefined,
  mapRef: undefined,
};

export default MobileView;
