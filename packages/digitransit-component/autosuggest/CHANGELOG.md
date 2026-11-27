# @digitransit-component/digitransit-component-autosuggest

## 11.2.0

### Minor Changes

- 63227b1: Add the `extraDescription` and `movesFocusOnSelect` props to autosuggest. The panel adds a translated description that the search starts automatically to a field only when the other field is set (not in the embedded search), and the origin field no longer claims that focus moves to the destination when the destination is set or on mobile.

### Patch Changes

- 32817ff: Make the input's accessible name contain the visible placeholder text so voice control can target the field.

## 11.1.0

### Minor Changes

- 6a65ac6: Give the input and the suggestion list a valid accessible name, add the `externalLabelId` prop for naming them by an existing label, and outline the highlighted suggestion.

### Patch Changes

- 3adf834: Round the highlighted suggestion frame so the top corners are not clipped by the list.
- Updated dependencies [7c22776]
  - @digitransit-search-util/digitransit-search-util-uniq-by-label@2.1.12
  - @digitransit-search-util/digitransit-search-util-get-label@1.0.14
