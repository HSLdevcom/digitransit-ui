import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const noop = () => {};

/**
 * Handle styling for when element is scrolled
 */
export default function ScrollableWrapper({
  scrollable = true,
  children,
  className = '',
  id = '',
  onScroll = noop,
}) {
  const [scrolledState, changeScroll] = useState(false);
  function handleScroll(e) {
    onScroll();
    if (!e.target.className.includes('scroll-target')) {
      return;
    }
    const isScrolled = e.target.scrollTop !== 0;
    changeScroll(isScrolled);
  }
  return (
    <>
      {scrollable && (
        <div
          className={cx('before-scrollable-area', {
            scrolled: scrollable && scrolledState,
          })}
        />
      )}
      <div
        className={cx(
          'scrollable-content-wrapper',
          'scroll-target',
          className,
          {
            'momentum-scroll': scrollable,
          },
        )}
        id={id}
        tabIndex={scrollable ? -1 : undefined} // Prevents browser from making overflow containers tab stops, which causes screen readers to announce all child content at once.
        onScroll={scrollable ? handleScroll : () => {}}
      >
        {children}
      </div>
    </>
  );
}

ScrollableWrapper.propTypes = {
  scrollable: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  onScroll: PropTypes.func,
};
