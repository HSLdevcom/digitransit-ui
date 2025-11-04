import PropTypes from 'prop-types';
import React from 'react';
import ReactSwipe from 'react-swipe';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';
import ScrollableWrapper from './ScrollableWrapper';
import TabBalls from './TabBalls';
import { isKeyboardSelectionEvent } from '../util/browser';

const setFocusables = () => {
  // Set inactive tab focusables to unfocusable and for active tab set previously made unfocusable elements to focusable
  const focusableTags =
    'a, button, input, textarea, select, details, [tabindex="0"]';
  const unFocusableTags =
    'a, button, input, textarea, select, details, [tabindex="-2"]';
  const swipeableTabs = document.getElementsByClassName('swipeable-tab');

  for (let i = 0; i < swipeableTabs.length; i++) {
    const focusables = swipeableTabs[i].querySelectorAll(focusableTags);
    const unFocusables = swipeableTabs[i].querySelectorAll(unFocusableTags);
    if (swipeableTabs[i].classList.contains('inactive')) {
      focusables.forEach(focusable => {
        // eslint-disable-next-line no-param-reassign
        focusable.tabIndex = '-2';
      });
    } else {
      unFocusables.forEach(unFocusable => {
        // eslint-disable-next-line no-param-reassign
        unFocusable.tabIndex = '0';
      });
    }
  }
};

export default class SwipeableTabs extends React.Component {
  constructor(props) {
    super(props);
    this.reactSwipeEl = React.createRef();
    this.swipeButtonNavRef = React.createRef(); // tracks if navigation was initiated by button.swipeButton
    this.state = {
      announceTabLabel: '',
    };
  }

  static propTypes = {
    tabIndex: PropTypes.number.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.node).isRequired,
    onSwipe: PropTypes.func.isRequired,
    hideArrows: PropTypes.bool,
    navigationOnBottom: PropTypes.bool,
    classname: PropTypes.string,
    ariaRole: PropTypes.string.isRequired,
  };

  static defaultProps = {
    hideArrows: false,
    navigationOnBottom: false,
    classname: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    window.addEventListener('resize', setFocusables);
    setFocusables();
  }

  componentDidUpdate() {
    setFocusables();
  }

  handleSwipeButtonNav = direction => {
    const { tabIndex, tabs, onSwipe } = this.props;
    let newIndex = tabIndex;
    if (direction === 'prev' && tabIndex > 0) {
      newIndex = tabIndex - 1;
    } else if (direction === 'next' && tabIndex < tabs.length - 1) {
      newIndex = tabIndex + 1;
    }
    if (newIndex !== tabIndex) {
      this.swipeButtonNavRef.current = true;
      // Get the tab context text from the DOM because aria-live cannot handle aria-describedby reference well enough
      const tabContextText =
        document.getElementById(`tab-${newIndex}-context`)?.textContent || '';
      this.setState({
        announceTabLabel: `${this.context.intl.formatMessage(
          {
            id: this.props.ariaRole,
            defaultMessage: 'Tab {number}',
          },
          { number: newIndex + 1 },
        )} ${tabContextText}`,
      });

      onSwipe(newIndex);
    }
  };

  handleTabBallsNav = newIndex => {
    this.swipeButtonNavRef.current = false;
    this.props.onSwipe(newIndex);
  };

  render() {
    const { tabs, hideArrows, navigationOnBottom } = this.props;
    const disabled = tabs.length < 2;

    const tabsWithId = tabs.map((tab, i) =>
      React.cloneElement(tab, {
        id: `tabpanel-${i}`,
        role: 'tabpanel',
        'aria-labelledby': `tab-${i}`,
      }),
    );

    return (
      <div
        className={
          this.props.classname === 'swipe-desktop-view'
            ? 'swipe-scroll-wrapper'
            : ''
        }
        role="tablist"
      >
        {navigationOnBottom && (
          <ScrollableWrapper>
            <div className="swipe-scroll-container scroll-target">
              <ReactSwipe
                swipeOptions={{
                  startSlide: this.props.tabIndex,
                  stopPropagation: true,
                  continuous: false,
                  callback: i => {
                    setTimeout(() => {
                      this.props.onSwipe(i);
                    }, 300);
                  },
                }}
                childCount={tabs.length}
                ref={this.reactSwipeEl}
              >
                {tabsWithId}
              </ReactSwipe>
            </div>
          </ScrollableWrapper>
        )}
        <div className={`swipe-header-container ${this.props.classname}`}>
          {this.props.classname === 'swipe-desktop-view' && (
            <div className="desktop-view-divider" />
          )}

          <div className="sr-only" aria-live="polite">
            {this.swipeButtonNavRef.current && this.state.announceTabLabel}
          </div>

          <div className={`swipe-header ${this.props.classname}`}>
            {!hideArrows && (
              <div
                className={cx('swipe-button-container', {
                  active: !(disabled || this.props.tabIndex <= 0),
                })}
              >
                <button
                  type="button"
                  className="swipe-button"
                  onClick={() => this.handleSwipeButtonNav('prev')}
                  onKeyDown={e => {
                    if (isKeyboardSelectionEvent(e)) {
                      this.handleSwipeButtonNav('prev');
                    }
                  }}
                  tabIndex="0"
                  aria-disabled={disabled || this.props.tabIndex <= 0}
                  aria-label={this.context.intl.formatMessage({
                    id: 'swipe-result-tab-left',
                    defaultMessage: 'Show previous tab.',
                  })}
                >
                  <Icon
                    img="icon_arrow-collapse--left"
                    className={`itinerary-arrow-icon ${
                      disabled || this.props.tabIndex <= 0 ? 'disabled' : ''
                    }`}
                  />
                </button>
              </div>
            )}
            <div className="swipe-tab-indicator">
              {!disabled && (
                <TabBalls
                  tabIndex={this.props.tabIndex}
                  tabsLength={tabs.length}
                  onSwipe={this.handleTabBallsNav}
                  reactSwipeEl={this.reactSwipeEl}
                  ariaRole={this.props.ariaRole}
                />
              )}
            </div>
            {!hideArrows && (
              <div
                className={cx('swipe-button-container', {
                  active: !(disabled || this.props.tabIndex >= tabs.length - 1),
                })}
              >
                <button
                  aria-disabled={
                    disabled || this.props.tabIndex >= tabs.length - 1
                  }
                  type="button"
                  className="swipe-button"
                  onClick={() => this.handleSwipeButtonNav('next')}
                  onKeyDown={e => {
                    if (isKeyboardSelectionEvent(e)) {
                      this.handleSwipeButtonNav('next');
                    }
                  }}
                  tabIndex="0"
                  aria-label={this.context.intl.formatMessage({
                    id: 'swipe-result-tab-right',
                    defaultMessage: 'Show next tab.',
                  })}
                >
                  <Icon
                    img="icon_arrow-collapse--right"
                    className={`itinerary-arrow-icon ${
                      disabled || this.props.tabIndex >= tabs.length - 1
                        ? 'disabled'
                        : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
        {!navigationOnBottom && (
          <ScrollableWrapper>
            <div className="swipe-scroll-container scroll-target">
              <ReactSwipe
                swipeOptions={{
                  startSlide: this.props.tabIndex,
                  continuous: false,
                  callback: i => {
                    setTimeout(() => {
                      this.props.onSwipe(i);
                    }, 300);
                  },
                }}
                childCount={tabs.length}
                ref={this.reactSwipeEl}
              >
                {tabsWithId}
              </ReactSwipe>
            </div>
          </ScrollableWrapper>
        )}
      </div>
    );
  }
}
