import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { getSuggestionContent, translateFutureRouteSuggestionTime } from '../utils/utils';

const Suggestion = memo(function Suggestion({
  item,
  lng,
  getItemProps,
  highlightedIndex,
  itemIndex,
  styles,
  ...rest
}) {
  const [t] = useTranslation();
  const newItem =
    item.type === 'FutureRoute'
      ? { ...item, translatedText: translateFutureRouteSuggestionTime(item, lng, t) }
      : item;
  const content = getSuggestionContent(item, lng, t);
  return (
    <li
      className={cx(
        styles.suggestion,
        highlightedIndex === itemIndex && styles.suggestionHighlighted,
      )}
      {...getItemProps({ index: itemIndex })}
    >
      <SuggestionItem item={newItem} content={content} lng={lng} {...rest} />
    </li>
  );
});
const itemShape = PropTypes.shape({
  name: PropTypes.string,
  type: PropTypes.string,
  address: PropTypes.string,
  selectedIconId: PropTypes.string,
  iconColor: PropTypes.string,
  translatedText: PropTypes.string,
  properties: PropTypes.shape({
    layer: PropTypes.string,
    color: PropTypes.string,
    localadmin: PropTypes.string,
    mode: PropTypes.string,
    id: PropTypes.string,
    source: PropTypes.string,
    arrowClicked: PropTypes.bool,
    destination: PropTypes.shape({ name: PropTypes.string, localadmin: PropTypes.string }),
    origin: PropTypes.shape({ name: PropTypes.string, localadmin: PropTypes.string }),
  }),
});

Suggestion.propTypes = {
  item: itemShape.isRequired,
  lng: PropTypes.string.isRequired,
  getItemProps: PropTypes.func.isRequired,
  highlightedIndex: PropTypes.number.isRequired,
  itemIndex: PropTypes.number.isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const Suggestions = memo(function Suggestions({
  suggestions,
  getMenuProps,
  label = undefined,
  labelledBy = undefined,
  getItemProps,
  lng,
  styles,
  hidden,
  renderClearHistoryButton = false,
  handleClearHistory = () => undefined,
  ...rest
}) {
  const [t] = useTranslation();
  return (
    <div
      className={cx([
        styles.suggestionsContainerOpen,
        styles.suggestionsContainer,
        hidden && styles.hidden,
      ])}
    >
      <ul
        className={styles.suggestionsList}
        {...getMenuProps({
          // Downshift would otherwise reference its own, unrendered label.
          'aria-label': label,
          'aria-labelledby': labelledBy,
        })}
      >
        {suggestions.map((suggestion, i) => {
          return (
            <Suggestion
              key={`${suggestion.type}-${
                suggestion.properties.gid ||
                suggestion.properties.gtfsId ||
                JSON.stringify(suggestion.properties)
              }`}
              getItemProps={getItemProps}
              itemIndex={i}
              item={suggestion}
              lng={lng}
              styles={styles}
              {...rest}
            />
          );
        })}
      </ul>
      {renderClearHistoryButton && (
        // Outside the listbox: it is not an option, so a button there is invalid.
        <button
          onClick={handleClearHistory}
          type="button"
          className={styles['clear-search-history']}
        >
          {t('clear-search-history', { lng })}
        </button>
      )}
    </div>
  );
});

Suggestions.propTypes = {
  suggestions: PropTypes.arrayOf(itemShape).isRequired,
  getMenuProps: PropTypes.func.isRequired,
  label: PropTypes.string,
  labelledBy: PropTypes.string,
  getItemProps: PropTypes.func.isRequired,
  lng: PropTypes.string.isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  hidden: PropTypes.bool.isRequired,
  renderClearHistoryButton: PropTypes.bool,
  handleClearHistory: PropTypes.func,
};
