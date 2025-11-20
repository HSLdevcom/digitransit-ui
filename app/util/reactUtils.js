/* eslint-disable no-underscore-dangle */
import React from 'react';

const FRAGMENT_SYMBOL =
  typeof Symbol === 'function' && Symbol.for
    ? Symbol.for('react.fragment')
    : 0xeacb;

const isFragment = element =>
  element &&
  element.type != null &&
  (element.type === React.Fragment ||
    element.type === FRAGMENT_SYMBOL ||
    element.type === 'react.fragment');

/**
 * Resolves a string identifier for a React element.
 * Priority order:
 *  1. Custom __TYPE prop (string)
 *  2. React.Fragment → 'react.fragment'
 *  3. displayName of the component
 *  4. Function name (for function components / classes)
 *  5. Fallback to component.type.toString() only as last resort (rarely needed)
 *
 * @param {ReactNode} element
 * @returns {string|undefined}
 */
export const typeOfComponent = element => {
  if (
    !element ||
    typeof element !== 'object' ||
    !React.isValidElement(element)
  ) {
    return undefined;
  }

  if (element.props && typeof element.props.__TYPE === 'string') {
    return element.props.__TYPE;
  }

  if (isFragment(element)) {
    return 'react.fragment';
  }

  const { type } = element;

  if (typeof type === 'function') {
    if (typeof type.__TYPE === 'string') {
      return type.__TYPE;
    }

    if (typeof type.displayName === 'string') {
      return type.displayName;
    }

    if (typeof type.name === 'string' && type.name !== '') {
      return type.name;
    }
  }

  if (typeof type === 'string') {
    return type;
  }

  return undefined;
};

/**
 * Returns **the first child** with type matching any of the provided type strings.
 *
 * @param {ReactNode} children
 * @param {string|string[]} types - One or many type strings to match
 * @returns {ReactNode|undefined} First matching child or undefined
 *
 */
export const getChildByType = (children, types) => {
  if (!children) {
    return undefined;
  }

  const wanted = new Set(Array.isArray(types) ? types : [types]);
  if (wanted.size === 0) {
    return undefined;
  }

  let result;

  React.Children.forEach(children, child => {
    if (result) {
      return;
    }

    if (!child || !React.isValidElement(child)) {
      return;
    }

    const type = typeOfComponent(child);
    if (type && wanted.has(type)) {
      result = child;
    }
  });

  return result;
};

/**
 * Returns **all** children that match any of the given type strings.
 *
 * @param {ReactNode} children
 * @param {string|string[]} types
 * @returns {ReactNode[]}
 *
 */
export const getChildrenByType = (children, types) => {
  if (!children) {
    return [];
  }

  const wanted = new Set(Array.isArray(types) ? types : [types]);
  if (wanted.size === 0) {
    return [];
  }

  const result = [];

  React.Children.forEach(children, child => {
    if (!child || !React.isValidElement(child)) {
      return;
    }

    const type = typeOfComponent(child);
    if (type && wanted.has(type)) {
      result.push(child);
    }
  });

  return result;
};

/**
 * Groups children by their resolved type.
 *
 * @param {ReactNode} children
 * @returns {{ [type: string]: ReactNode[] }}
 *
 */
export const groupChildrenByType = children => {
  if (!children) {
    return {};
  }

  const groups = Object.create(null);

  React.Children.forEach(children, child => {
    if (!child || !React.isValidElement(child)) {
      return;
    }

    const type = typeOfComponent(child) || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(child);
  });

  return groups;
};
