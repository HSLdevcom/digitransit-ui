import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// @hsl-fi/modal (react-modal) needs a real DOM node matching its
// appElement selector for react-modal's aria-hider.
document.body.innerHTML = '<div id="app"></div>';

afterEach(() => {
  cleanup();
});
