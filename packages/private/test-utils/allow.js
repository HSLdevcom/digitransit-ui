import axe from 'axe-core';

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

/**
 * Throws unless every allow entry has a known axe rule id and a reason.
 *
 * @param {Array<{ rule: string, selector?: string, reason: string }>} allow
 */
export function validateAllow(allow) {
  allow.forEach(({ rule, reason }) => {
    if (!rule || !reason) {
      throw new Error('Each a11y allow entry needs a rule and a reason');
    }
    if (!isKnownRule(rule)) {
      throw new Error(`Unknown axe rule in a11y allow entry: ${rule}`);
    }
  });
}

/**
 * Splits axe violation nodes into those no allow entry covers and the allow
 * entries that covered nothing.
 *
 * @param {import('axe-core').Result[]} violations
 * @param {Array<{ rule: string, selector?: string, reason: string }>} allow
 * @returns {{ failures: Array<{ violation: import('axe-core').Result, node: import('axe-core').NodeResult }>, unused: Array<{ rule: string, selector?: string }> }}
 */
export function applyAllow(violations, allow) {
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
      .map(node => ({ violation, node })),
  );
  const unused = allow.filter((_, i) => !used.has(i));
  return { failures, unused };
}
