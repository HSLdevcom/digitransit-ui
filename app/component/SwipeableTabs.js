import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import ReactSwipe from 'react-swipe';
import cx from 'classnames';
import Icon from './Icon';
import ScrollableWrapper from './ScrollableWrapper';
import TabBalls from './TabBalls';
import { useTranslationsContext } from '../util/useTranslationsContext';
import { isKeyboardSelectionEvent } from '../util/browser';

export function setFocusables() {
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
}

export default function SwipeableTabs({
  tabIndex,
  tabs,
  onSwipe,
  hideArrows,
  navigationOnBottom,
  classname,
  ariaRole,
}) {
  const intl = useTranslationsContext();
  const reactSwipeEl = useRef();
  const swipeButtonNavRef = useRef(); // tracks if navigation was initiated by button.swipeButton
  const [announceTabLabel, setAnnounceTabLabel] = useState('');

  useEffect(() => {
    setFocusables();
    window.addEventListener('resize', setFocusables);
    return () => window.removeEventListener('resize', setFocusables);
  }, []);

  useEffect(() => {
    setFocusables();
  }, [tabIndex]);

  const handleSwipeButtonNav = direction => {
    let newIndex = tabIndex;
    if (direction === 'prev' && tabIndex > 0) {
      newIndex = tabIndex - 1;
    } else if (direction === 'next' && tabIndex < tabs.length - 1) {
      newIndex = tabIndex + 1;
    }
    if (newIndex !== tabIndex) {
      swipeButtonNavRef.current = true;
      // Get the tab context text from the DOM because aria-live cannot handle aria-describedby reference well enough
      const tabContextText =
        document.getElementById(`tab-${newIndex}-context`)?.textContent || '';
      setAnnounceTabLabel(
        `${intl.formatMessage(
          {
            id: ariaRole,
            defaultMessage: 'Tab {number}',
          },
          { number: newIndex + 1 },
        )} ${tabContextText}`,
      );

      onSwipe(newIndex);
    }
  };

  const handleTabBallsNav = newIndex => {
    swipeButtonNavRef.current = false;
    onSwipe(newIndex);
  };

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
        classname === 'swipe-desktop-view' ? 'swipe-scroll-wrapper' : ''
      }
      role="tablist"
    >
      {navigationOnBottom && (
        <ScrollableWrapper>
          <div className="swipe-scroll-container scroll-target">
            <ReactSwipe
              swipeOptions={{
                startSlide: tabIndex,
                stopPropagation: true,
                continuous: false,
                callback: i => {
                  setTimeout(() => onSwipe(i), 300);
                },
              }}
              childCount={tabs.length}
              ref={reactSwipeEl}
            >
              {tabsWithId}
            </ReactSwipe>
          </div>
        </ScrollableWrapper>
      )}
      <div className={`swipe-header-container ${classname}`}>
        {classname === 'swipe-desktop-view' && (
          <div className="desktop-view-divider" />
        )}

        <div className="sr-only" aria-live="polite">
          {swipeButtonNavRef.current && announceTabLabel}
        </div>

        <div className={`swipe-header ${classname}`}>
          {!hideArrows && (
            <div
              className={cx('swipe-button-container', {
                active: !(disabled || tabIndex <= 0),
              })}
            >
              <button
                type="button"
                className="swipe-button"
                onClick={() => handleSwipeButtonNav('prev')}
                onKeyDown={e => {
                  if (isKeyboardSelectionEvent(e)) {
                    handleSwipeButtonNav('prev');
                  }
                }}
                tabIndex="0"
                aria-disabled={disabled || tabIndex <= 0}
                aria-label={intl.formatMessage({
                  id: 'swipe-result-tab-left',
                  defaultMessage: 'Show previous tab.',
                })}
              >
                <Icon
                  img="icon_arrow-collapse--left"
                  className={`itinerary-arrow-icon ${
                    disabled || tabIndex <= 0 ? 'disabled' : ''
                  }`}
                />
              </button>
            </div>
          )}
          <div className="swipe-tab-indicator">
            {!disabled && (
              <TabBalls
                tabIndex={tabIndex}
                tabsLength={tabs.length}
                onSwipe={handleTabBallsNav}
                reactSwipeEl={reactSwipeEl}
                ariaRole={ariaRole}
              />
            )}
          </div>
          {!hideArrows && (
            <div
              className={cx('swipe-button-container', {
                active: !(disabled || tabIndex >= tabs.length - 1),
              })}
            >
              <button
                aria-disabled={disabled || tabIndex >= tabs.length - 1}
                type="button"
                className="swipe-button"
                onClick={() => handleSwipeButtonNav('next')}
                onKeyDown={e => {
                  if (isKeyboardSelectionEvent(e)) {
                    handleSwipeButtonNav('next');
                  }
                }}
                tabIndex="0"
                aria-label={intl.formatMessage({
                  id: 'swipe-result-tab-right',
                  defaultMessage: 'Show next tab.',
                })}
              >
                <Icon
                  img="icon_arrow-collapse--right"
                  className={`itinerary-arrow-icon ${
                    disabled || tabIndex >= tabs.length - 1 ? 'disabled' : ''
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
                startSlide: tabIndex,
                continuous: false,
                callback: i => {
                  setTimeout(() => onSwipe(i), 300);
                },
              }}
              childCount={tabs.length}
              ref={reactSwipeEl}
            >
              {tabsWithId}
            </ReactSwipe>
          </div>
        </ScrollableWrapper>
      )}
    </div>
  );
}

SwipeableTabs.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.node).isRequired,
  onSwipe: PropTypes.func.isRequired,
  hideArrows: PropTypes.bool,
  navigationOnBottom: PropTypes.bool,
  classname: PropTypes.string,
  ariaRole: PropTypes.string.isRequired,
};

SwipeableTabs.defaultProps = {
  hideArrows: false,
  navigationOnBottom: false,
  classname: undefined,
};
