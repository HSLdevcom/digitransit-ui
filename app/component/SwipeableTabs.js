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
    classname: PropTypes.string,
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
        <div
          key={key}
          className={`swipe-tab-ball ${
            index === this.state.tabIndex ? 'selected' : ''
          } ${ball.smaller ? 'decreasing-small' : ''} ${
            ball.small ? 'decreasing' : ''
          } ${ball.hidden ? 'hidden' : ''}`}
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

  handleAccessibilityNavigation = e => {
    // Prevents keyboard navigation out of visible swipe tabs
    if (e.keyCode !== 9) {
      return;
    }
    const focusableTags =
      'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

    const allKeyboardfocusableElements = document.querySelectorAll(
      focusableTags,
    );
    const swipeContainerElements = document.getElementsByClassName(
      'react-swipe-container',
    )[0].childNodes[0];

    const tabElements = swipeContainerElements.childNodes;
    const currentTabElement = tabElements[this.state.tabIndex].childNodes[0];
    const currentTabKeyboardfocusableElements = currentTabElement.querySelectorAll(
      focusableTags,
    );
    if (!currentTabKeyboardfocusableElements.length) {
      return;
    }

    const lastTabElement = tabElements[tabElements.length - 1].childNodes[0];
    const lastKeyboardfocusableElements = lastTabElement.querySelectorAll(
      focusableTags,
    );
    const lastTabFocusableElement =
      lastKeyboardfocusableElements[lastKeyboardfocusableElements.length - 1];

    let elementAfterLastSwipeElement;
    allKeyboardfocusableElements.forEach((el, index) => {
      if (el === lastTabFocusableElement) {
        const element = allKeyboardfocusableElements[index + 1];
        elementAfterLastSwipeElement =
          element || allKeyboardfocusableElements[0];
      }
    });

    let nextIndex;
    Object.values(currentTabKeyboardfocusableElements).forEach(
      (value, index) => {
        if (e.target === value) {
          nextIndex = index + 1;
        }
      },
    );
    // Get next focusable element in current tab. If it doesn't exist focus to next element outside swipe tabs
    const nextFocusable = currentTabKeyboardfocusableElements[nextIndex];
    if (!nextFocusable) {
      e.preventDefault();
      if (nextIndex === currentTabKeyboardfocusableElements.length) {
        elementAfterLastSwipeElement.focus();
      } else {
        currentTabKeyboardfocusableElements[0].focus();
      }
    }
  };

  setHiddenTabsUntabbable = () => {
    const { tabs } = this.props;

    const unTabbableTabs = tabs.map((tab, index) => {
      return (
        <div
          key={tab.key}
          style={{ outline: 'none' }}
          tabIndex={index === this.state.tabIndex ? '0' : '-1'}
        >
          {tab}
        </div>
      );
    });
    return unTabbableTabs;
  };

  render() {
    const tabs = this.setHiddenTabsUntabbable();
    const tabBalls = this.tabBalls(tabs.length);
    const disabled = tabBalls.length < 2;
    let reactSwipeEl;

    return (
      <div>
        <div className={`swipe-header-container ${this.props.classname}`}>
          <div
            className={`swipe-header ${this.props.classname || ''}`}
            role="row"
            onKeyDown={e => this.handleKeyPress(e, reactSwipeEl)}
            aria-label={this.context.intl.formatMessage({
              id: 'swipe-result-tabs',
              defaultMessage:
                'Swipe result tabs. Navigate with left and right arrow',
            })}
            tabIndex="0"
          >
            <div className="swipe-button-container">
              <div
                className="swipe-button"
                onClick={() => reactSwipeEl.prev()}
                onKeyDown={e => {
                  if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    reactSwipeEl.prev();
                  }
                }}
                role="button"
                tabIndex="0"
                aria-label={this.context.intl.formatMessage({
                  id: 'swipe-result-tab-left',
                  defaultMessage:
                    'Swipe result tabs left arrow. Press enter or space to show previous result.',
                })}
              >
                <Icon
                  img="icon-icon_arrow-collapse--left"
                  className={`itinerary-arrow-icon ${
                    disabled || this.state.tabIndex <= 0 ? 'disabled' : ''
                  }`}
                />
              </div>
            </div>
            <div className="swipe-tab-indicator">
              {disabled ? null : tabBalls}
            </div>
            <div className="swipe-button-container">
              <div
                className="swipe-button"
                onClick={() => reactSwipeEl.next()}
                onKeyDown={e => {
                  if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault();
                    reactSwipeEl.next();
                  }
                }}
                role="button"
                tabIndex="0"
                aria-label={this.context.intl.formatMessage({
                  id: 'swipe-result-tab-right',
                  defaultMessage:
                    'Swipe result tabs right arrow. Press enter or space to show next result.',
                })}
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
          </div>
        </div>
        <span>
          <div
            tabIndex="0"
            role="tablist"
            onKeyDown={this.handleAccessibilityNavigation}
          >
            <ReactSwipe
              swipeOptions={{
                startSlide: this.props.tabIndex,
                continuous: false,
                callback: i => {
                  // force transition after animation should be over because animation can randomly fail sometimes
                  setTimeout(() => {
                    this.setState({ tabIndex: i });
                    this.props.onSwipe(i);
                  }, 300);
                },
              }}
              childCount={tabs.length}
              ref={el => {
                reactSwipeEl = el;
              }}
            >
              {tabs}
            </ReactSwipe>
          </div>
        </span>
      </div>
    );
  }
}
