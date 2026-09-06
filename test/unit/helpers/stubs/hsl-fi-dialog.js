// Test stub for `@hsl-fi/dialog` (aliased in config/vitest.config.js's `app`
// project). The real package is ESM-only with a large @radix-ui /
// bundled-CSS dep tree the unit tests never exercise. This keeps just enough
// interactive behaviour for the tests that assert on open/close + Escape.
import React from 'react';
import PropTypes from 'prop-types';

export const Modal = ({ open, onOpenChange, children }) =>
  open
    ? React.createElement(
        'div',
        {
          role: 'dialog',
          onKeyDown: event => {
            if (event.key === 'Escape') {
              onOpenChange(false);
            }
          },
          tabIndex: -1,
        },
        children,
      )
    : null;
Modal.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  children: PropTypes.node,
};

export const ModalContent = ({ title, description }) =>
  React.createElement(
    'div',
    { className: 'modal-content' },
    title,
    description,
  );
ModalContent.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
};

export const ModalTrigger = () => null;
export const ConfirmationModalContent = () => null;
export const ScrollableModalContent = () => null;
