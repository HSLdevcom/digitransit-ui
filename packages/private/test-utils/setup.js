import { expect, onTestFinished } from 'vitest';
import { checkA11y } from './a11y';

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
