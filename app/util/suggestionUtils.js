import uniqWith from 'lodash/uniqWith';

const getLocality = suggestion => suggestion.localadmin || suggestion.locality || '';

export function getLabel(suggestion) { // eslint-disable-line import/prefer-default-export
  return suggestion.name ? `${suggestion.name}, ${getLocality(suggestion)}` : suggestion.label;
}

export function uniqByLabel(features) {
  return uniqWith(features, (feat1, feat2) =>
    getLabel(feat1.properties) === getLabel(feat2.properties)
  );
}
