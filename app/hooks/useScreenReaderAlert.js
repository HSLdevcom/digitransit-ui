import React, { useRef } from 'react';

/**
 * DOM wrapper for screen reader alert announcements.
 *
 * @example
 * const MyComponent = ({reactIntl}) => {
 *   const { element, pushAlert } = useScreenReader(reactIntl);
 *   return (
 *     <>
 *       {element}
 *       <button onClick={() => pushAlert("button-push-alert-message-id")}>
 *         Test screen reader alert
 *       </button>
 *     </>
 *   )
 * }
 */
export default ({ intl }) => {
  const ref = useRef();

  const element = (
    <div
      className="sr-only"
      role="alert"
      ref={ref}
      id="summarypage-screenreader-alert"
    />
  );

  /**
   * Flash alert message in DOM screen reader element for 100 ms
   *
   * @param {string} intlMessageId
   * @param {string} defaultMessage
   */
  const pushAlert = (intlMessageId, defaultMessage) => {
    if (!ref.current) {
      return;
    }

    if (ref.current.innerHTML) {
      ref.current.innerHTML = null;
    }

    ref.current.innerHTML = intl.formatMessage({
      id: intlMessageId,
      defaultMessage,
    });

    // clear message
    setTimeout(() => {
      ref.current.innerHTML = null;
    }, 100);
  };

  return {
    pushAlert,
    element,
  };
};
