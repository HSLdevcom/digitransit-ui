import { useEffect, useState } from 'react';

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
  const [size, setSize] = useState(getSize(window));

  useEffect(() => {
    const onResize = () => setSize(getSize(window));
    window.addEventListener('resize', onResize);

    // clear event listener on unmount
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
};

export default useWindowSize;
