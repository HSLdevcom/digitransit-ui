import { validateAllow } from './allow';

// Settings for the current test's automatic scan, reset after each test.
let allowed = [];
let skipReason;

/**
 * Allows known violations in the current test's automatic scan. Call it in
 * the test or in a `beforeEach`. An entry that matches nothing fails the test.
 *
 * @param {Array<{ rule: string, selector?: string, reason: string }>} entries
 */
export function allowA11y(entries) {
  validateAllow(entries);
  allowed = [...allowed, ...entries];
}

/**
 * Skips the current test's automatic scan.
 *
 * @param {string} reason why the rendered DOM can't or needn't be scanned.
 */
export function skipA11yScan(reason) {
  if (!reason) {
    throw new Error('skipA11yScan() needs a reason');
  }
  skipReason = reason;
}

/**
 * Returns the current test's scan settings and resets them.
 *
 * @returns {{ allow: Array<{ rule: string, selector?: string, reason: string }>, skipped: boolean }}
 */
export function takeScanSettings() {
  const settings = { allow: allowed, skipped: !!skipReason };
  allowed = [];
  skipReason = undefined;
  return settings;
}
