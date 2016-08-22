const getLocality = suggestion => suggestion.localadmin || suggestion.locality || '';

export function getLabel(suggestion) { // eslint-disable-line import/prefer-default-export
  return suggestion.name ? `${suggestion.name}, ${getLocality(suggestion)}` : suggestion.label;
}
