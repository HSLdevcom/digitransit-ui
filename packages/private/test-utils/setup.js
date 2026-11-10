import { afterEach, expect, onTestFinished } from 'vitest';
// Imported before the scan hook is registered, so RTL's auto-cleanup hook is
// registered first and, in Vitest's default stack order, runs after the scan.
import '@testing-library/react';
import { checkA11y } from './a11y';
import { isOrphanListItem, SCAN_OPTIONS } from './rules';
import { takeScanSettings } from './scan';

// Tests that ran the full check, so the automatic scan skips them.
const checkedTests = new WeakSet();

expect.extend({
  /**
   * Asserts that the element's subtree has no axe-core violations, e.g.
   * `await expect(document.body).toHaveNoA11yViolations()`.
   *
   * Known issues are listed in `allow` as `{ rule, selector?, reason }`.
   * Every entry needs a known axe rule id and a `reason`, and an entry that
   * matches nothing fails the test so the list cannot go stale. `selector`
   * limits the entry to nodes inside an element matching that CSS selector.
   *
   * @param {Element} received scanned subtree; `document.body` includes portals.
   * @param {{ allow?: Array<{ rule: string, selector?: string, reason: string }> }} [options]
   */
  async toHaveNoA11yViolations(received, { allow = [] } = {}) {
    if (this.isNot) {
      throw new Error('.not.toHaveNoA11yViolations() is not supported');
    }
    if (!(received instanceof Element)) {
      throw new TypeError('toHaveNoA11yViolations() expects an element');
    }
    checkedTests.add(this.task);

    // Vitest does not track unawaited custom matchers. An unawaited check
    // could scan the DOM after cleanup and pass, so it fails the test.
    let settled = false;
    onTestFinished(() => {
      if (!settled) {
        throw new Error('toHaveNoA11yViolations() must be awaited');
      }
    });

    try {
      const problems = await checkA11y(received, allow);
      return {
        pass: problems.length === 0,
        message: () =>
          `Accessibility check failed:\n  ${problems.join('\n  ')}`,
      };
    } finally {
      settled = true;
    }
  },
});

// Scans the DOM each test leaves behind.
afterEach(async ({ task }) => {
  const { allow, skipped } = takeScanSettings();
  if (skipped || task.result?.state === 'fail') {
    return;
  }
  if (checkedTests.has(task)) {
    if (allow.length) {
      throw new Error(
        'allowA11y() entries are unused in a test that runs toHaveNoA11yViolations(); pass them as its allow option',
      );
    }
    return;
  }
  const problems = await checkA11y(document.body, allow, {
    options: SCAN_OPTIONS,
    ignore: isOrphanListItem,
  });
  if (problems.length) {
    throw new Error(
      `Accessibility scan failed:\n  ${problems.join(
        '\n  ',
      )}\nFix the markup, or use allowA11y() or skipA11yScan() from @digitransit-ui/test-utils.`,
    );
  }
});
