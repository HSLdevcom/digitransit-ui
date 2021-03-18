import PropTypes from 'prop-types';
import React from 'react';
import ReactSwipe from 'react-swipe';
import { intlShape } from 'react-intl';
import Icon from './Icon';

export default class SwipeableTabs extends React.Component {
  constructor(props) {
    super();
    this.state = {
      tabIndex: props.tabIndex || 0,
    };
  }

  static propTypes = {
    tabIndex: PropTypes.number,
    tabs: PropTypes.array.isRequired,
    onSwipe: PropTypes.func,
    desktop: PropTypes.bool,
    hideArrows: PropTypes.bool,
    navigationOnBottom: PropTypes.bool,
    classname: PropTypes.string,
  };

  static defaultProps = {
    hideArrows: false,
    navigationOnBottom: false,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  setDecreasingAttributes = tabBalls => {
    const newTabBalls = tabBalls;
    for (let i = 0; i < tabBalls.length; i++) {
      const prev = tabBalls[i - 1];
      const current = tabBalls[i];
      const next = tabBalls[i + 1];
      if (prev && prev.hidden && !current.hidden) {
        current.smaller = true;
        next.small = true;
        newTabBalls[i] = current;
        newTabBalls[i + 1] = next;
        break;
      }
    }
    return newTabBalls;
  };

  tabBalls = tabsLength => {
    const tabIndex = parseInt(this.state.tabIndex, 10);
    const onLeft = tabIndex;
    const onRight = tabsLength - tabIndex - 1;
    let tabBalls = [];

    for (let i = 0; i < tabsLength; i++) {
      const ballObj = { hidden: false };
      const distanceFromSelected = Math.abs(i - tabIndex);
      let n = 7;
      for (let j = -1; j <= 7; j++) {
        let maxDistance = 0;
        if ((onLeft > 7 && onRight > -1) || (onLeft > -1 && onRight > 7)) {
          maxDistance = 6;
        }
        if ((onLeft > 6 && onRight > 0) || (onLeft > 0 && onRight > 6)) {
          maxDistance = 5;
        }
        if ((onLeft > 5 && onRight > 1) || (onLeft > 1 && onRight > 5)) {
          maxDistance = 4;
        }
        if (
          (onLeft > 4 && onRight > 2) ||
          (onLeft > 3 && onRight > 3) ||
          (onLeft > 2 && onRight > 4)
        ) {
          maxDistance = 3;
        }
        if (onLeft > n && onRight > j && distanceFromSelected > maxDistance) {
          ballObj.hidden = true;
        }
        n -= 1;
      }

      if (tabIndex === i) {
        ballObj.selected = true;
        ballObj.hidden = false;
      }

      tabBalls.push(ballObj);
    }

    tabBalls = this.setDecreasingAttributes(tabBalls);
    tabBalls = this.setDecreasingAttributes(tabBalls.reverse());
    tabBalls.reverse();
    const ballDivs = tabBalls.map((ball, index) => {
      const key = ball.toString().length + index;
      return (
        // eslint-disable-next-line
        <div
          key={key}
          role="button"
          className={`swipe-tab-ball ${
            index === this.state.tabIndex ? 'selected' : ''
          } ${ball.smaller ? 'decreasing-small' : ''} ${
            ball.small ? 'decreasing' : ''
          } ${ball.hidden ? 'hidden' : ''}`}
          onClick={() => {
            this.setState({ tabIndex: index });
            this.props.onSwipe(index);
          }}
        />
      );
    });

    return ballDivs;
  };

  handleKeyPress = (e, reactSwipeEl) => {
    switch (e.keyCode) {
      case 37:
        reactSwipeEl.prev();
        break;
      case 39:
        reactSwipeEl.next();
        break;
      default:
        break;
    }
  };

  render() {
    const { tabs, hideArrows, navigationOnBottom } = this.props;
    const tabBalls = this.tabBalls(tabs.length);
    const disabled = tabBalls.length < 2;
    let reactSwipeEl;

    return (
      <div
        className={`swipe-header-container ${
          this.props.desktop ? 'desktop' : ''
        }`}
      >
        {navigationOnBottom && (
          <ReactSwipe
            swipeOptions={{
              startSlide: this.props.tabIndex,
              continuous: false,
              transitionEnd: e => {
                this.setState({ tabIndex: e });
                this.props.onSwipe(e);
              },
            }}
            childCount={tabs.length}
            ref={el => {
              reactSwipeEl = el;
            }}
          >
            {tabs}
          </ReactSwipe>
        )}
        <div className={`swipe-header-container ${this.props.classname}`}>
          <div
            className={`swipe-header ${this.props.classname}`}
            role="row"
            onKeyDown={e => this.handleKeyPress(e, reactSwipeEl)}
            aria-label="Swipe result tabs. Navigave with left and right arrow"
            tabIndex="0"
          >
            {!hideArrows && (
              <div className="swipe-button-container">
                <div
                  className="swipe-button"
                  onClick={() => reactSwipeEl.prev()}
                  onKeyDown={() => {}}
                  role="button"
                  tabIndex="0"
                >
                  <Icon
                    img="icon-icon_arrow-collapse--left"
                    className={`itinerary-arrow-icon ${
                      disabled || this.state.tabIndex <= 0 ? 'disabled' : ''
                    }`}
                  />
                </div>
              </div>
            )}
            <div className="swipe-tab-indicator">
              {disabled ? null : tabBalls}
            </div>
            {!hideArrows && (
              <div className="swipe-button-container">
                <div
                  className="swipe-button"
                  onClick={() => reactSwipeEl.next()}
                  onKeyDown={() => {}}
                  role="button"
                  tabIndex="0"
                >
                  <Icon
                    img="icon-icon_arrow-collapse--right"
                    className={`itinerary-arrow-icon ${
                      disabled || this.state.tabIndex >= tabs.length - 1
                        ? 'disabled'
                        : ''
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {!navigationOnBottom && (
          <ReactSwipe
            swipeOptions={{
              startSlide: this.props.tabIndex,
              continuous: false,
              transitionEnd: e => {
                this.setState({ tabIndex: e });
                this.props.onSwipe(e);
              },
            }}
            childCount={tabs.length}
            ref={el => {
              reactSwipeEl = el;
            }}
          >
            {tabs}
          </ReactSwipe>
        )}
      </div>
    );
  }
}
