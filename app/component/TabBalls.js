import React, { useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';

function setDecreasingAttributes(tabBalls) {
  const newTabBalls = tabBalls;
  for (let i = 0; i < tabBalls.length; i++) {
    const prev = tabBalls[i - 1];
    const current = tabBalls[i];
    const next = tabBalls[i + 1];
    if (prev && prev.hidden && !current.hidden) {
      current.smaller = true;
      if (next) {
        next.small = true;
      }
      newTabBalls[i] = current;
      newTabBalls[i + 1] = next;
      break;
    }
  }
  return newTabBalls;
}

const TabBalls = (
  { tabIndex, tabsLength, onSwipe, reactSwipeEl, ariaRole },
  { intl },
) => {
  const tabRefs = useRef([]);
  const lastKeyboardNav = useRef(false);

  useLayoutEffect(() => {
    if (lastKeyboardNav.current && tabRefs.current[tabIndex]) {
      tabRefs.current[tabIndex].focus();
    }
    lastKeyboardNav.current = false;
  }, [tabIndex]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      if (reactSwipeEl?.current) {
        reactSwipeEl.current.next();
      }
      if (index + 1 < tabsLength && tabRefs.current[index + 1]) {
        lastKeyboardNav.current = true;
        onSwipe(index + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (reactSwipeEl?.current) {
        reactSwipeEl.current.prev();
      }
      if (index - 1 >= 0 && tabRefs.current[index - 1]) {
        lastKeyboardNav.current = true;
        onSwipe(index - 1);
      }
    }
  };

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
  tabBalls = setDecreasingAttributes(tabBalls);
  tabBalls = setDecreasingAttributes(tabBalls.reverse());
  tabBalls.reverse();

  return tabBalls.map((ball, index) => {
    const key = ball.toString().length + index;
    let className = 'swipe-tab-ball';
    if (index === tabIndex) {
      className += ' selected';
    }
    if (ball.smaller) {
      className += ' decreasing-small';
    }
    if (ball.small) {
      className += ' decreasing';
    }
    if (ball.hidden) {
      className += ' sr-only';
    }
    return (
      <button
        id={`tab-${index}`}
        key={key}
        ref={el => {
          tabRefs.current[index] = el;
        }}
        type="button"
        role="tab"
        aria-label={`${index + 1}.`}
        aria-selected={index === tabIndex}
        aria-roledescription={`${intl.formatMessage(
          {
            id: ariaRole,
            defaultMessage: 'Tab {number}',
          },
          { number: undefined },
        )}`}
        aria-controls={`tabpanel-${index}`}
        aria-describedby={`tab-${index}-context`}
        tabIndex={index === tabIndex ? 0 : -1}
        className={className}
        onClick={() => onSwipe(index)}
        onKeyDown={e => handleKeyDown(e, index)}
      />
    );
  });
};

TabBalls.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  tabsLength: PropTypes.number.isRequired,
  onSwipe: PropTypes.func.isRequired,
  ariaRole: PropTypes.string.isRequired,
};

TabBalls.contextTypes = {
  intl: intlShape.isRequired,
};

TabBalls.defaultProps = {
  reactSwipeEl: undefined,
};

export default TabBalls;
