import PropTypes from 'prop-types';
import React, { memo } from 'react';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import { intlShape } from 'react-intl';
import { configShape } from '../../util/shapes';
import {
  withSearchContext,
  getLocationSearchTargets,
} from '../WithSearchContext';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

function Search({ onMap, ...rest }, { config, intl, getStore }) {
  const searchProps = {
    id: 'origin-stop-near-you',
    placeholder: 'origin',
    translatedPlaceholder: onMap
      ? intl.formatMessage({ id: 'move-on-map' })
      : undefined,
    mobileLabel: onMap ? intl.formatMessage({ id: 'position' }) : undefined,
    inputClassName: onMap ? 'origin-stop-near-you-selector' : undefined,
    colors: config.colors,
    modeSet: config.iconModeSet,
    getAutoSuggestIcons: config.getAutoSuggestIcons,
  };
  const sources = ['History', 'Datasource'];
  if (getStore('FavouriteStore').getLocationCount()) {
    sources.push('Favourite');
  }
  return (
    <DTAutoSuggestWithSearchContext
      appElement="#app"
      icon="search"
      sources={sources}
      targets={getLocationSearchTargets(config, false)}
      value=""
      {...searchProps}
      {...rest}
    />
  );
}

Search.propTypes = {
  onMap: PropTypes.bool,
};

Search.defaultProps = {
  onMap: false,
};

Search.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default memo(Search);
