
/**
 * Create a cancelable function call wrapper for callbacks intended
 * to be asynchronously called from React component. Cancelable
 * returns cancel() function to make later function call noop.
 *
 * @returns {Object}
 *
 * @example
 * const { cancelable, cancel } = createCancelable()
 * const sayHello = () => {
 *   console.log("hello")
 * }
 * setTimeout(cancelable(sayHello), 1000)
 * cancel() // "hello" is never printed
 */
 const createCancelable = () => {
    let isCanceled = false;
    return {
      cancelable: fn => (...args) => (!isCanceled ? fn(...args) : undefined),
      cancel: () => {
        console.log("make canceled true")
        isCanceled = true;
      },
    };
  };
  
  export default createCancelable;