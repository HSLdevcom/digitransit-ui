import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import Shimmer from '@hsl-fi/shimmer';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import Icon, {
  defaultColors,
} from '@digitransit-component/digitransit-component-icon';
import { formatFavouritePlaceLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import styles from './helpers/styles.scss';
import i18n from './helpers/i18n';

const TOGGLE_DEBOUNCE_MS = 200;
const LIST_BOTTOM_MARGIN = 16;
const MIN_LIST_HEIGHT = 120;

const FAVOURITE_ICON_ID_TO_NAME = {
  'icon-icon_place': 'place',
  'icon-icon_home': 'home',
  'icon-icon_work': 'work',
  'icon-icon_sport': 'sport',
  'icon-icon_school': 'school',
  'icon-icon_shopping': 'shopping',
  // Map two buggy ids temporarily. This code can be removed at some point.
  icon_home: 'home',
  icon_work: 'work',
};

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';
  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

/**
 * Utility to format location [name, address] pair.
 * @param {LocationProperties} favourite
 * @returns {Array.<string>}
 */
const formatFavourite = favourite =>
  favourite && (favourite.name || favourite.address)
    ? formatFavouritePlaceLabel(favourite.name, favourite.address)
    : [];

const FavouriteLocation = ({
  clickItem,
  iconId,
  text,
  label,
  isLoading = false,
  color,
  lang,
}) => {
  const [t] = useTranslation('translation', { i18n });
  const ariaLabel =
    label === ''
      ? text
      : `${text} ${label} ${t('add-destination', { lng: lang })}`;
  return (
    <button
      type="button"
      tabIndex="0"
      className={cx(styles['favourite-content'])}
      onClick={clickItem}
      onKeyDown={e => isKeyboardSelectionEvent(e) && clickItem()}
      aria-label={ariaLabel}
    >
      <Shimmer active={isLoading} className={styles.shimmer}>
        <span className={cx(styles.icon, styles[iconId])}>
          <Icon img={iconId} color={color} />
        </span>
        <div className={styles['favourite-location']}>
          <div className={styles.name}>{text}</div>
          <div className={styles.address}>{label}</div>
        </div>
      </Shimmer>
    </button>
  );
};

FavouriteLocation.propTypes = {
  clickItem: PropTypes.func.isRequired,
  iconId: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  color: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

/**
 * FavouriteBar renders favourites. FavouriteBar displays the first two favourites, the rest are shown in a list.
 * @example
 * <FavouriteBar
 *   favourites={favourites}
 *   onClickFavourite={onClickFavourite}
 *   onAddPlace={onAddPlace}
 *   onEdit={onEdit}
 *   onAddHome={onAddHome}
 *   onAddWork={onAddWork}
 *   lang={lang}
 *   isLoading={isLoading}
 * />
 */
function FavouriteBar({
  favourites,
  onClickFavourite,
  onAddPlace,
  onEdit,
  onAddHome,
  onAddWork,
  lang = 'fi',
  isLoading = false,
  colors = defaultColors,
}) {
  const [t] = useTranslation('translation', { i18n });
  const [listOpen, setListOpen] = useState(false);
  const [listMaxHeight, setListMaxHeight] = useState(null);
  const expandListRef = useRef(null);
  const suggestionListRef = useRef(null);
  const firstItemRef = useRef(null);
  const lastToggleRef = useRef(0);
  const focusAfterToggleRef = useRef(false);

  const firstFavourite = favourites[0] || null;
  const secondFavourite = favourites[1] || null;
  const listFavourites = favourites.slice(2);

  const translate = id => t(id, { lng: lang });

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        suggestionListRef.current &&
        expandListRef.current &&
        !suggestionListRef.current.contains(event.target) &&
        !expandListRef.current.contains(event.target)
      ) {
        setListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Let the list grow down to the bottom edge of the viewport
  useEffect(() => {
    if (!listOpen) {
      return undefined;
    }
    const updateListMaxHeight = () => {
      const list = suggestionListRef.current;
      if (list) {
        const { top } = list.getBoundingClientRect();
        setListMaxHeight(
          Math.max(
            window.innerHeight - top - LIST_BOTTOM_MARGIN,
            MIN_LIST_HEIGHT,
          ),
        );
      }
    };
    updateListMaxHeight();
    window.addEventListener('resize', updateListMaxHeight);
    return () => window.removeEventListener('resize', updateListMaxHeight);
  }, [listOpen]);

  // Move focus only after a toggle, not when the list is closed by other means
  useEffect(() => {
    if (focusAfterToggleRef.current) {
      focusAfterToggleRef.current = false;
      if (listOpen) {
        firstItemRef.current?.focus();
      } else {
        expandListRef.current?.focus();
      }
    }
  }, [listOpen]);

  const toggleList = () => {
    const now = Date.now();
    if (now - lastToggleRef.current > TOGGLE_DEBOUNCE_MS) {
      lastToggleRef.current = now;
      focusAfterToggleRef.current = true;
      setListOpen(open => !open);
    }
  };

  const getCustomSuggestions = () => {
    const customSuggestions = [
      {
        name: translate('add-place'),
        selectedIconId: 'favourite',
      },
    ];
    if (favourites.length === 0) {
      return customSuggestions;
    }
    return [
      ...customSuggestions,
      {
        name: translate('edit'),
        selectedIconId: 'edit',
      },
    ];
  };

  const suggestionSelected = index => {
    if (index < listFavourites.length) {
      onClickFavourite(listFavourites[index]);
    } else if (index === listFavourites.length) {
      onAddPlace();
    } else if (index === listFavourites.length + 1) {
      onEdit();
    }
    toggleList();
  };

  const handleKeyDown = (event, index) => {
    const key = (event && (event.key || event.which || event.keyCode)) || '';
    if (isKeyboardSelectionEvent(event)) {
      if (!listOpen) {
        toggleList();
      } else {
        suggestionSelected(index);
      }
    } else if (key === 'Escape' || key === 27) {
      if (listOpen) {
        toggleList();
      }
    } else if (
      key === 'Tab' &&
      !event.shiftKey &&
      index === listFavourites.length + getCustomSuggestions().length - 1
    ) {
      setListOpen(false);
    }
  };

  const renderSuggestion = (item, index, ariaLabelSuffix = '') => {
    const id = `favourite-suggestion-list--item-${index}`;
    return (
      <li key={`favourite-suggestion-item-${index}`}>
        <div
          role="button"
          type="button"
          tabIndex="0"
          id={id}
          className={cx(styles['favourite-suggestion-item'])}
          onClick={() => suggestionSelected(index)}
          onKeyDown={e => handleKeyDown(e, index)}
          ref={index === 0 ? firstItemRef : undefined}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={index === 0}
          aria-label={`${item?.name || ''} ${
            item?.address || ''
          } ${ariaLabelSuffix}`}
        >
          <SuggestionItem item={item} colors={colors} />
        </div>
      </li>
    );
  };

  const { primary } = colors;
  const expandIcon = favourites.length === 0 ? 'plus' : 'arrow';

  const [name1, address1] = formatFavourite(firstFavourite);
  const [name2, address2] = formatFavourite(secondFavourite);

  return (
    <div>
      <div className={styles['favourite-container']}>
        <FavouriteLocation
          text={name1 || translate('add-home')}
          label={address1 || ''}
          clickItem={() =>
            firstFavourite ? onClickFavourite(firstFavourite) : onAddHome()
          }
          iconId={
            firstFavourite && firstFavourite.selectedIconId
              ? FAVOURITE_ICON_ID_TO_NAME[firstFavourite.selectedIconId]
              : 'home'
          }
          isLoading={isLoading}
          color={primary}
          lang={lang}
        />
        <FavouriteLocation
          text={name2 || translate('add-work')}
          label={address2 || ''}
          clickItem={() =>
            secondFavourite ? onClickFavourite(secondFavourite) : onAddWork()
          }
          iconId={
            secondFavourite && secondFavourite.selectedIconId
              ? FAVOURITE_ICON_ID_TO_NAME[secondFavourite.selectedIconId]
              : 'work'
          }
          isLoading={isLoading}
          color={primary}
          lang={lang}
        />
        {/* eslint-disable jsx-a11y/role-supports-aria-props */}
        <button
          type="button"
          className={cx(styles.expandButton, styles[expandIcon], {
            [styles.rotate]: listOpen,
          })}
          ref={expandListRef}
          id="favourite-expand-button"
          onKeyDown={e => handleKeyDown(e)}
          onClick={toggleList}
          aria-expanded={listOpen}
          aria-label={translate('open-favourites')}
        >
          <Shimmer active={isLoading}>
            <Icon img={expandIcon} color={primary} />
          </Shimmer>
        </button>
        {/* eslint-enable jsx-a11y/role-supports-aria-props */}
      </div>
      <div className={styles['favourite-suggestion-container']}>
        {listOpen && (
          <ul
            className={styles['favourite-suggestion-list']}
            id="favourite-suggestion-list"
            style={listMaxHeight ? { maxHeight: listMaxHeight } : undefined}
            ref={suggestionListRef}
            aria-label={translate('favourites-list')}
          >
            {listFavourites.map((item, index) => {
              const favouriteLabel = formatFavouritePlaceLabel(
                item.name,
                item.address,
              );
              const address = favouriteLabel[1];

              return renderSuggestion(
                {
                  ...item,
                  address,
                },
                index,
                `, ${translate('add-destination')}`,
              );
            })}
            {listFavourites.length > 0 && (
              <div aria-hidden className={styles.divider} />
            )}
            {getCustomSuggestions().map((item, index) =>
              renderSuggestion(item, listFavourites.length + index, undefined),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

FavouriteBar.propTypes = {
  /** Required. Array of favourites, favourite object contains following properties.
   * @type {Array<object>}
   * @property {string} address
   * @property {string} gtfsId
   * @property {string} gid
   * @property {number} lat
   * @property {number} lon
   * @property {string} name
   * @property {string} selectedIconId
   * @property {string} favouriteId
   */
  favourites: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      gtfsId: PropTypes.string,
      gid: PropTypes.string,
      lat: PropTypes.number,
      name: PropTypes.string,
      lon: PropTypes.number,
      selectedIconId: PropTypes.string,
      favouriteId: PropTypes.string,
    }),
  ).isRequired,
  /** Required. Function for clicking favourites. */
  onClickFavourite: PropTypes.func.isRequired,
  /** Required. Function for selecting "Add place" from suggestions. */
  onAddPlace: PropTypes.func.isRequired,
  /** Required. Function for selected "Edit" from suggestions. */
  onEdit: PropTypes.func.isRequired,
  /** Required. Function for "Add home" button. */
  onAddHome: PropTypes.func.isRequired,
  /** Required. Function for "Add work" button. */
  onAddWork: PropTypes.func.isRequired,
  /** Optional. Language, fi, en or sv. */
  lang: PropTypes.string,
  /** Optional. Whether to show loading animation, true or false. */
  isLoading: PropTypes.bool,
  /** Optional color palette */
  colors: PropTypes.objectOf(PropTypes.string),
};

export default FavouriteBar;
