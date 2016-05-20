const getLocality = suggestion => suggestion.localadmin || suggestion.locality || '';

export function getLabel(suggestion) {
  return suggestion.name ? `${suggestion.name}, ${getLocality(suggestion)}` : suggestion.label;
}
