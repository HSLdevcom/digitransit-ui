import { useEffect, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const getSize = window => ({
  width: window.innerWidth,
  height: window.innerHeight,
  outer: {
    width: window.outerWidth,
    height: window.outerHeight,
  },
});

/**
 * @typedef {Object} Size
 * @property {Number} width
 * @property {Number} height
 *
 * @typedef {Object} WindowSize
 * @property {Number} width
 * @property {Number} height
 * @property {Size} outer
 */

/**
 * Get browser window size.
 *
 * @returns {WindowSize}
 */
const useWindowSize = () => {
  const [size, setSize] = useState(
    isBrowser
      ? getSize(window)
      : {
          width: undefined,
          height: undefined,
          outer: {
            width: undefined,
            height: undefined,
          },
        },
  );

  useEffect(() => {
    const onResize = () => setSize(getSize(window));
    window.addEventListener('resize', onResize);

    // clear event listener on unmount
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
};

export default useWindowSize;
