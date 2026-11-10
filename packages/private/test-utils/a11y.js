import axe from 'axe-core';
import { act } from '@testing-library/react';

// Rules that cannot work on components rendered in jsdom. Rules for <html>
// and <title> need no entry: they never apply when scanning document.body.
const DISABLED_RULES = [
  // Need canvas and layout, so jsdom only ever reports them as incomplete.
  'color-contrast',
  'label-content-name-mismatch',
  // Needs layout, so it always passes.
  'target-size',
  // Rendered components are not inside page landmarks.
  'region',
];

const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: [
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22a',
      'wcag22aa',
      'best-practice',
    ],
  },
  rules: Object.fromEntries(DISABLED_RULES.map(id => [id, { enabled: false }])),
  // Only violations are read; element refs allow scoping allow entries.
  resultTypes: ['violations'],
  elementRef: true,
  // jsdom cannot fetch stylesheets.
  preload: false,
};

let ruleIds;
const isKnownRule = id => {
  ruleIds ??= new Set(axe.getRules().map(({ ruleId }) => ruleId));
  return ruleIds.has(id);
};

/** Like `Element.closest`, but continues from a shadow root to its host. */
const closestComposed = (element, selector) => {
  let current = element;
  while (current) {
    const match = current.closest(selector);
    if (match) {
      return match;
    }
    current = current.getRootNode().host;
  }
  return null;
};

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

const describeNode = node => `${node.target.join(' ')}: ${node.html}`;

/**
 * Asserts that the rendered DOM has no axe-core violations.
 *
 * Known issues are listed in `allow` as `{ rule, selector?, reason }`.
 * Every entry needs a known axe rule id and a `reason`, and an entry that
 * matches nothing fails the test so the list cannot go stale. `selector`
 * limits the entry to nodes inside an element matching that CSS selector.
 *
 * @param {Element} [root] scanned subtree, defaults to the whole body so that
 * portals are included.
 * @param {{ allow?: Array<{ rule: string, selector?: string, reason: string }> }} [options]
 */
export async function expectNoA11yViolations(
  root = document.body,
  { allow = [] } = {},
) {
  allow.forEach(({ rule, reason }) => {
    if (!rule || !reason) {
      throw new Error('Each a11y allow entry needs a rule and a reason');
    }
    if (!isKnownRule(rule)) {
      throw new Error(`Unknown axe rule in a11y allow entry: ${rule}`);
    }
  });

  const { violations } = await runAxe(root);

  const used = new Set();
  const isAllowed = (violation, node) =>
    allow.some((entry, i) => {
      const matches =
        entry.rule === violation.id &&
        (!entry.selector || !!closestComposed(node.element, entry.selector));
      if (matches) {
        used.add(i);
      }
      return matches;
    });

  const failures = violations.flatMap(violation =>
    violation.nodes
      .filter(node => !isAllowed(violation, node))
      .map(
        node =>
          `${violation.impact} ${violation.id}: ${violation.help} (${
            violation.helpUrl
          })\n    ${describeNode(node)}`,
      ),
  );
  const stale = allow
    .filter((_, i) => !used.has(i))
    .map(({ rule, selector }) => `${rule}${selector ? ` (${selector})` : ''}`);

  const problems = [
    ...failures,
    ...stale.map(s => `Unused a11y allow entry: ${s}`),
  ];
  if (problems.length > 0) {
    throw new Error(`Accessibility check failed:\n  ${problems.join('\n  ')}`);
  }
}
