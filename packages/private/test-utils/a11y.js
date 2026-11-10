import axe from 'axe-core';
import { act } from '@testing-library/react';
import { applyAllow, validateAllow } from './allow';
import { AXE_OPTIONS } from './rules';

// axe.run throws if another run is in progress, so runs are queued.
let queue = Promise.resolve();
const runAxe = root => {
  const run = queue.then(async () => {
    let results;
    // Inside act so state updates scheduled meanwhile (e.g. react-modal's
    // animation frames) don't warn.
    await act(async () => {
      results = await axe.run(root, AXE_OPTIONS);
    });
    return results;
  });
  queue = run.catch(() => {});
  return run;
};

const describeFailure = ({ violation, node }) =>
  `${violation.impact} ${violation.id}: ${violation.help} (${
    violation.helpUrl
  })\n    ${node.target.join(' ')}: ${node.html}`;

const describeUnused = ({ rule, selector }) =>
  `Unused a11y allow entry: ${rule}${selector ? ` (${selector})` : ''}`;

/**
 * Runs axe-core on `root` and lists the problems: violations no allow entry
 * covers, and allow entries that covered nothing.
 *
 * @param {Element} root
 * @param {Array<{ rule: string, selector?: string, reason: string }>} allow
 * @returns {Promise<string[]>}
 */
export async function checkA11y(root, allow) {
  validateAllow(allow);
  const { violations } = await runAxe(root);
  const { failures, unused } = applyAllow(violations, allow);
  return [...failures.map(describeFailure), ...unused.map(describeUnused)];
}
