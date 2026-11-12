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

/** axe-core run options: WCAG 2.x A/AA and best-practice rules. */
export const AXE_OPTIONS = {
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

// A component rendered on its own, such as a list row, has no parent list.
// aria-required-parent also checks tabs, options and rows, so the scan
// ignores only its list item nodes instead of disabling it.

/** Options for the automatic scan after each test: AXE_OPTIONS without `listitem`. */
export const SCAN_OPTIONS = {
  ...AXE_OPTIONS,
  rules: { ...AXE_OPTIONS.rules, listitem: { enabled: false } },
};

/**
 * Whether the automatic scan ignores a violation node: a list item without
 * its parent list.
 *
 * @param {import('axe-core').Result} violation
 * @param {import('axe-core').NodeResult} node
 */
export const isOrphanListItem = (violation, node) =>
  violation.id === 'aria-required-parent' &&
  node.element.getAttribute('role') === 'listitem';
