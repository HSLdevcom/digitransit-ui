import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { configShape } from '../util/shapes';
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
    mapRef: PropTypes.shape({ current: PropTypes.object }),
    match: matchShape.isRequired,
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

  static contextTypes = {
    config: configShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.resetBottomSheet = true;
  }

  onScroll = e => {
    if (this.props.map && e.target.className === 'drawer-container') {
      this.props.mapRef?.current?.setBottomPadding(e.target.scrollTop);
    }
  };

  // eslint-disable-next-line
  setBottomSheet = (pos, slowly) => {
    if (this.scrollRef) {
      const newPosition =
        pos === 'middle' ? getMiddlePosition() : BOTTOM_SHEET_OFFSET;
      if (slowly) {
        slowlyScrollTo(this.scrollRef, newPosition, () => {
          this.props.mapRef?.current?.forceRefresh();
          this.props.mapRef?.current?.setBottomPadding(newPosition);
        });
      } else {
        this.scrollRef.scrollTop = newPosition;
        this.props.mapRef?.current?.setBottomPadding(newPosition);
      }
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextPage = nextProps.match.location.pathname.split('/')[1];
    const page = this.props.match.location.pathname.split('/')[1];
    if (page !== nextPage) {
      // view change should reset bottom sheet position
      this.resetBottomSheet = true;
    }
  }

  componentDidMount() {
    if (this.scrollRef) {
      const newSheetPosition = getMiddlePosition();
      this.scrollRef.scrollTop = newSheetPosition;
    }
  }

  componentDidUpdate() {
    if (this.scrollRef && this.resetBottomSheet) {
      this.resetBottomSheet = false;
      const newSheetPosition = getMiddlePosition();
      this.scrollRef.scrollTop = newSheetPosition;
      if (this.props.mapRef) {
        this.props.mapRef?.current?.forceRefresh();
        this.props.mapRef.current?.setBottomPadding(newSheetPosition);
      }
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
            {map}
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
