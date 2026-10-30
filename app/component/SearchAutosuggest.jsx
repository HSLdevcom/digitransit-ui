import PropTypes from 'prop-types';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { SearchProvider, useSearchContext } from '../hooks/SearchContext';
import { addAnalyticsEvent } from '../../utils/shared/analyticsUtils';
import { SEARCH_PATH_OPTS } from '../../utils/client/searchUtils';
import SearchSelectionBoundary from './SearchSelectionBoundary';

function SearchInput({
  panel,
  fromMap,
  isMobile,
  showViapointControl,
  ...rest
}) {
  const {
    searchContext,
    onSelect,
    selectHandler,
    locationState,
    onGeolocationStart,
  } = useSearchContext();
  const Component = panel ? DTAutosuggestPanel : DTAutoSuggest;
  const viaProps = showViapointControl
    ? { handleViaPointLocationSelected: onSelect }
    : {};

  return (
    <Component
      appElement="#app"
      searchContext={searchContext}
      addAnalyticsEvent={addAnalyticsEvent}
      onSelect={onSelect}
      selectHandler={selectHandler}
      locationState={locationState}
      onGeolocationStart={onGeolocationStart}
      fromMap={fromMap}
      isMobile={isMobile}
      showViapointControl={showViapointControl}
      {...rest}
      {...viaProps}
      pathOpts={SEARCH_PATH_OPTS}
    />
  );
}

SearchInput.propTypes = {
  panel: PropTypes.bool.isRequired,
  fromMap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isMobile: PropTypes.bool.isRequired,
  showViapointControl: PropTypes.bool.isRequired,
};

export default function SearchAutosuggest({
  selectHandler,
  onGeolocationStart = null,
  embeddedSearch = false,
  fromMap,
  onFromMapClose = null,
  isMobile = false,
  showViapointControl = false,
  panel = false,
  ...rest
}) {
  return (
    <SearchProvider
      selectHandler={selectHandler}
      onGeolocationStart={onGeolocationStart}
      embeddedSearch={embeddedSearch}
      fromMap={fromMap}
      onFromMapClose={onFromMapClose}
    >
      <SearchSelectionBoundary>
        <SearchInput
          panel={panel}
          fromMap={fromMap}
          isMobile={isMobile}
          showViapointControl={showViapointControl}
          {...rest}
        />
      </SearchSelectionBoundary>
    </SearchProvider>
  );
}

SearchAutosuggest.propTypes = {
  selectHandler: PropTypes.func.isRequired,
  onGeolocationStart: PropTypes.func,
  embeddedSearch: PropTypes.bool,
  fromMap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFromMapClose: PropTypes.func,
  isMobile: PropTypes.bool,
  showViapointControl: PropTypes.bool,
  panel: PropTypes.bool,
};

export function SearchAutosuggestPanel(props) {
  return <SearchAutosuggest {...props} panel />;
}
