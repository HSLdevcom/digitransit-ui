import React, { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Text, Button, Spacer } from '@hsl-fi/layout-primitives';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover({
  icon,
  onClose,
  header = null,
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

  const buttonLabel = buttonText || intl.formatMessage({ id: 'acknowledged' });
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
            {header && (
              <>
                <Text variant="routes-m-bold">{header}</Text>
                <Spacer size="xxs" />
              </>
            )}
            <Text variant="text-xs">{message}</Text>
            <Spacer size="xs" />
            <Button
              size="s"
              variant="primary"
              expand
              onClick={e => {
                e.stopPropagation();
                dismiss();
              }}
              onKeyDown={handleKeyboardClose}
              aria-label={buttonLabel}
            >
              <span className="button-label"> {buttonLabel} </span>
            </Button>
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
  header: PropTypes.node,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
  targetRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
  highlight: PropTypes.bool,
};
