import axe from 'axe-core';
import { act } from '@testing-library/react';

// Rules jsdom cannot evaluate (no layout/CSS/canvas) or that only apply to
// whole pages, while tests render isolated components.
const DISABLED_RULES = [
  'color-contrast',
  'label-content-name-mismatch',
  'region',
  'landmark-one-main',
  'page-has-heading-one',
  'document-title',
  'html-has-lang',
];

const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  rules: Object.fromEntries(DISABLED_RULES.map(id => [id, { enabled: false }])),
};

const describeNode = node => `${node.target.join(' ')}: ${node.html}`;

/**
 * Asserts that the rendered DOM has no axe-core violations.
 *
 * Known issues are listed in `allow` as `{ rule, selector?, reason }`.
 * Every entry needs a `reason`, and an entry that matches nothing fails the
 * test so the list cannot go stale. `selector` limits the entry to nodes
 * inside an element matching that CSS selector.
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
  });

  // axe is async; run it inside act so state updates scheduled meanwhile
  // (e.g. react-modal's animation frames) don't warn.
  let violations;
  await act(async () => {
    ({ violations } = await axe.run(root, AXE_OPTIONS));
  });

  const used = new Set();
  const isAllowed = (violation, node) =>
    allow.some((entry, i) => {
      const matches =
        entry.rule === violation.id &&
        (!entry.selector ||
          !!document.querySelector(node.target[0])?.closest(entry.selector));
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
