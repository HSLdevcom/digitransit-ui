import PropTypes from 'prop-types';
import React from 'react';
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

export default class MobileView extends React.Component {
  static propTypes = {
    header: PropTypes.node,
    map: PropTypes.node,
    content: PropTypes.node,
    settingsDrawer: PropTypes.node,
    selectFromMapHeader: PropTypes.node,
    searchBox: PropTypes.node,
    // eslint-disable-next-line
    mapRef: PropTypes.object,
  };

  static defaultProps = {
    header: undefined,
    map: undefined,
    content: undefined,
    settingsDrawer: undefined,
    selectFromMapHeader: undefined,
    searchBox: undefined,
    mapRef: undefined,
  };

  constructor(props) {
    super(props);
    this.resetBottomSheet = true;
    this.state = { bottomPadding: getMiddlePosition() };
  }

  onScroll = e => {
    if (e.target.className === 'drawer-container') {
      this.props.mapRef?.setBottomPadding(e.target.scrollTop);
      this.setState({ bottomPadding: e.target.scrollTop });
    }
  };

  setBottomPadding = (padding, slowly) => {
    if (slowly) {
      slowlyScrollTo(this.scrollRef, padding, () => {
        this.props.mapRef?.forceRefresh();
        this.props.mapRef?.setBottomPadding(padding);
        this.setState({ bottomPadding: padding });
      });
    } else {
      if (this.scrollRef) {
        this.scrollRef.scrollTop = padding;
      }
      this.props.mapRef?.setBottomPadding(padding);
      this.setState({ bottomPadding: padding });
    }
  };

  // eslint-disable-next-line
  setBottomSheet = (pos, slowly) => {
    const pad = pos === 'middle' ? getMiddlePosition() : BOTTOM_SHEET_OFFSET;
    this.setBottomPadding(pad);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.header !== this.props.header) {
      // view change should reset bottom sheet position
      this.resetBottomSheet = true;
    }
  }

  componentDidMount() {
    this.setBottomPadding(getMiddlePosition());
  }

  componentDidUpdate() {
    if (this.resetBottomSheet) {
      this.resetBottomSheet = false;
      this.props.mapRef?.forceRefresh();
      this.setBottomPadding(getMiddlePosition());
    }
  }

  render() {
    const {
      header,
      map,
      content,
      settingsDrawer,
      selectFromMapHeader,
      searchBox,
    } = this.props;

    if (settingsDrawer) {
      return <div className="mobile">{settingsDrawer}</div>;
    }

    return (
      <div className="mobile">
        {selectFromMapHeader}
        {searchBox}
        {map ? (
          <>
            <MapBottomsheetContext.Provider value={this.state.bottomPadding}>
              {map}
            </MapBottomsheetContext.Provider>
            <div
              className="drawer-container"
              onScroll={this.onScroll}
              ref={el => {
                this.scrollRef = el;
              }}
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
}
