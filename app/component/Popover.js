import React, { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover({
  icon,
  onClose,
  message,
  buttonText = null,
  targetRef,
  highlight = false,
}) {
  const intl = useIntl();
  const [isDismissed, setDismissed] = useState(false);
  const [rect, setRect] = useState(null);

  const closeLabel = intl.formatMessage({
    id: 'close',
    defaultMessage: 'Close',
  });

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const nextRect = targetRef.current?.getBoundingClientRect();
      if (nextRect && nextRect.width && nextRect.height) {
        setRect(nextRect);
      }
    });

    return () => cancelAnimationFrame(id);
  }, [targetRef]);

  if (!rect) {
    return null;
  }

  const popoverTop = rect.bottom + 20;
  const popoverLeft = Math.max(16, rect.left - 160);

  const dismiss = () => {
    setDismissed(true);
    onClose();
  };

  const handleKeyboardClose = e => {
    if (isKeyboardSelectionEvent(e)) {
      e.stopPropagation();
      dismiss();
    }
  };

  return (
    <>
      {highlight && (
        <>
          <div
            className={`popover-overlay ${isDismissed ? 'fade-away' : ''}`}
          />
          <div
            className={`popover-highlight ${isDismissed ? 'fade-away' : ''}`}
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        </>
      )}

      <div
        className="popover-layer"
        style={{
          top: popoverTop,
          left: popoverLeft,
        }}
      >
        <div
          className={`popover ${isDismissed ? 'fade-away' : ''}`}
          aria-live="polite"
          role="alert"
        >
          <span className="icon-area">{icon}</span>
          <div className="popover-content">
            <div className="message">{message}</div>

            <button
              type="button"
              tabIndex="0"
              onClick={e => {
                e.stopPropagation();
                dismiss();
              }}
              onKeyDown={handleKeyboardClose}
              className="popover-acknowledge-button"
              aria-label={intl.formatMessage({
                id: 'acknowledged',
                defaultMessage: 'Understood',
              })}
            >
              {buttonText || (
                <FormattedMessage id="acknowledged" defaultMessage="Got it!" />
              )}
            </button>
          </div>

          <button
            type="button"
            tabIndex="0"
            onClick={e => {
              e.stopPropagation();
              dismiss();
            }}
            onKeyDown={handleKeyboardClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="noborder cursor-pointer popover-close-button"
          >
            <Icon img="icon_close" />
          </button>
        </div>
      </div>
    </>
  );
}

Popover.propTypes = {
  icon: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
  targetRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
  highlight: PropTypes.bool,
};
