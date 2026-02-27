import PropTypes from 'prop-types';
import React, { memo } from 'react';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import {
  withSearchContext,
  getLocationSearchTargets,
} from '../WithSearchContext';
import { countLocations } from '../../store/FavouriteStore';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import { useFavourites } from '../../hooks/FavouriteContext';
import { useConfigContext } from '../../configurations/ConfigContext';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

function Search({ onMap, ...rest }) {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  const favourites = useFavourites();
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
    lang: config.language,
  };
  const sources = ['History', 'Datasource'];
  if (countLocations(favourites)) {
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

Search.propTypes = { onMap: PropTypes.bool };
Search.defaultProps = { onMap: false };

export default memo(Search);
