import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Handle styling for when element is scrolled
 */
export default function ScrollableWrapper({
  scrollable,
  children,
  className,
  id,
  onScroll,
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

ScrollableWrapper.defaultProps = {
  scrollable: true,
  children: null,
  className: '',
  id: '',
  onScroll: () => {},
};
