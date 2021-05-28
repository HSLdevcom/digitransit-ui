import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

/**
 * Handle styling for when element is scrolled
 */
export default function ScrollableWrapper({ scrollable, children, className }) {
  if (!scrollable) {
    return (
      <div className={cx('scrollable-content-wrapper', className)}>
        {children}
      </div>
    );
  }
  const [scrolledState, changeScroll] = useState(false);
  function handleScroll(e) {
    const isScrolled = e.target.scrollTop !== 0;
    changeScroll(isScrolled);
  }
  return (
    <>
      <div
        className={cx('before-scrollable-area', {
          scrolled: scrollable && scrolledState,
        })}
      />
      <div
        className={cx('scrollable-content-wrapper', className, {
          'momentum-scroll': scrollable,
        })}
        onScroll={handleScroll}
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
};

ScrollableWrapper.defaultProps = {
  scrollable: true,
  children: null,
  className: '',
};
