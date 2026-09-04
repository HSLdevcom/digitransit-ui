import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render } from '@testing-library/react';
import DialogModalModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const DialogModal = DialogModalModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

// @hsl-fi/dialog is ESM-only and can't be require()'d in this CommonJS test
// environment, so stub-esm-peer-deps.js (--require'd by this package's test
// script) replaces Modal/ConfirmationModalContent with a stub that always
// renders null. That means this test can only verify the component mounts
// without throwing for its real, un-stubbed prop wiring - not the dialog's
// actual rendered content or button behavior. Revisit once @hsl-fi/dialog can
// be loaded for real in a CJS test environment.
describe('Testing @digitransit-component/digitransit-component-dialog-modal module', () => {
  it('renders without throwing when open', () => {
    expect(() =>
      render(
        h(DialogModal, {
          isModalOpen: true,
          headerText: 'Delete this place?',
          primaryButtonText: 'Delete',
          primaryButtonOnClick: () => {},
          lang: 'en',
        }),
      ),
    ).to.not.throw();
  });

  it('renders without throwing when closed', () => {
    expect(() =>
      render(
        h(DialogModal, {
          isModalOpen: false,
          headerText: 'Delete this place?',
          primaryButtonText: 'Delete',
          primaryButtonOnClick: () => {},
          lang: 'en',
        }),
      ),
    ).to.not.throw();
  });
});
