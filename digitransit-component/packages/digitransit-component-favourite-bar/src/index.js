import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import escapeRegExp from 'lodash/escapeRegExp';
import Shimmer from '@hsl-fi/shimmer';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

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

const FavouriteLocation = ({
  className,
  clickItem,
  iconId,
  text,
  label,
  isLoading,
  color,
}) => {
  const ariaLabel =
    label === '' ? text : `${text} ${label} ${i18next.t('add-destination')}`;
  return (
    <div
      role="button"
      tabIndex="0"
      className={cx(styles['favourite-content'], styles[className])}
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
    </div>
  );
};

FavouriteLocation.propTypes = {
  clickItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconId: PropTypes.string,
  text: PropTypes.string,
  label: PropTypes.string,
  isLoading: PropTypes.bool,
  color: PropTypes.string.isRequired,
};

/**
 * FavouriteBar renders favourites. FavouriteBar displays the first two favourites, the rest are shown in a list.
 * @example
 * <FavouriteBar
 *   favourites={favourites}
 *   onClickFavourite={onClickFavourite}
 *   onAddPlace={this.addPlace}
 *   onAddHome={this.addHome}
 *   onAddWork={this.addWork}
 *   lang={this.props.lang}
 *   isLoading={this.props.isLoading}
 * />
 */
class FavouriteBar extends React.Component {
  static propTypes = {
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
    /** Optional. Function for clicking favourites. */
    onClickFavourite: PropTypes.func,
    /** Optional. Function for selecting "Add place" from suggestions. */
    onAddPlace: PropTypes.func,
    /** Optional. Function for selected "Edit" from suggestions. */
    onEdit: PropTypes.func,
    /** Optional. Function for "Add home" button. */
    onAddHome: PropTypes.func,
    /** Optional. Function for "Add work" button. */
    onAddWork: PropTypes.func,
    /** Optional. Language, fi, en or sv. */
    lang: PropTypes.string,
    /** Optional. Whether to show loading animation, true or false. */
    isLoading: PropTypes.bool,
    /** Optional. Default value is '#007ac9'. */
    color: PropTypes.string,
    /** Optional. */
    fontWeights: PropTypes.shape({
      /** Default value is 500. */
      bold: PropTypes.number,
    }),
  };

  static defaultProps = {
    onClickFavourite: () => ({}),
    onAddPlace: () => ({}),
    onEdit: () => ({}),
    onAddHome: () => ({}),
    onAddWork: () => ({}),
    lang: 'fi',
    isLoading: false,
    color: '#007ac9',
    fontWeights: {
      bold: 500,
    },
  };

  static FavouriteIconIdToNameMap = {
    'icon-icon_place': 'place',
    'icon-icon_home': 'home',
    'icon-icon_work': 'work',
    'icon-icon_sport': 'sport',
    'icon-icon_school': 'school',
    'icon-icon_shopping': 'shopping',
  };

  constructor(props) {
    super(props);
    this.state = {
      listOpen: false,
      highlightedIndex: 0,
      firstFavourite: props.favourites[0] || null,
      secondFavourite: props.favourites[1] || null,
      favourites: props.favourites.slice(2, props.favourites.length),
      timestamp: 0,
    };
    this.expandListRef = React.createRef();
    this.suggestionListRef = React.createRef();
    Object.keys(translations).forEach(lang => {
      i18next.addResourceBundle(lang, 'translation', translations[lang]);
    });
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { favourites } = prevState;
    const nextFavourites = nextProps.favourites;
    if (
      !isEmpty(differenceWith(nextFavourites, favourites, isEqual)) ||
      !isEmpty(differenceWith(favourites, nextFavourites, isEqual)) ||
      !isEqual(nextFavourites, favourites) ||
      isEmpty(nextFavourites)
    ) {
      return {
        firstFavourite: nextFavourites[0] || null,
        secondFavourite: nextFavourites[1] || null,
        favourites: nextFavourites.slice(2, nextFavourites.length),
      };
    }
    return null;
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  toggleList = () => {
    const eventDiff = new Date().getTime() - this.state.timestamp;
    if (i18next.language !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
    if (eventDiff > 200) {
      this.setState(prevState => ({
        listOpen: !prevState.listOpen,
        highlightedIndex: 0,
        timestamp: new Date().getTime(),
      }));
    }
  };

  highlightSuggestion = index => {
    this.setState({ highlightedIndex: index });
  };

  handleClickOutside = event => {
    if (
      this.suggestionListRef.current &&
      this.expandListRef.current &&
      !this.suggestionListRef.current.contains(event.target) &&
      !this.expandListRef.current.contains(event.target)
    ) {
      this.setState({
        listOpen: false,
      });
    }
  };

  suggestionSelected = () => {
    const { favourites, highlightedIndex } = this.state;
    if (highlightedIndex < favourites.length) {
      this.props.onClickFavourite(favourites[highlightedIndex]);
    } else if (highlightedIndex === favourites.length) {
      this.props.onAddPlace();
    } else if (highlightedIndex === favourites.length + 1) {
      this.props.onEdit();
    }
    this.toggleList();
  };

  handleKeyDown = event => {
    const { favourites, highlightedIndex, listOpen } = this.state;
    const key = (event && (event.key || event.which || event.keyCode)) || '';
    if (isKeyboardSelectionEvent(event)) {
      if (!listOpen) {
        this.toggleList();
      } else {
        this.suggestionSelected();
      }
    } else if (key === 'Escape' || key === 27) {
      if (listOpen) {
        this.toggleList();
      }
    } else if (key === 'ArrowUp' || key === 38) {
      const next =
        highlightedIndex === 0 ? favourites.length + 1 : highlightedIndex - 1;
      this.highlightSuggestion(next);
    } else if (key === 'ArrowDown' || key === 40) {
      const next =
        highlightedIndex === favourites.length + 1 ? 0 : highlightedIndex + 1;
      this.highlightSuggestion(next);
    } else if (key === 'Tab' || key === 9) {
      this.setState({ listOpen: false });
    }
  };

  renderSuggestion = (item, index, className = undefined) => {
    const { highlightedIndex } = this.state;
    const id = `favourite-suggestion-list--item-${index}`;
    const selected = highlightedIndex === index;
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    // The key event is handled by the button that opens the dropdown
    return (
      <li
        key={`favourite-suggestion-item-${index}`}
        id={id}
        className={cx(
          styles['favourite-suggestion-item'],
          selected ? styles.highlighted : '',
        )}
        onMouseEnter={() => this.highlightSuggestion(index)}
        onClick={this.suggestionSelected}
        aria-selected={selected}
        role="option"
      >
        <SuggestionItem
          item={item}
          iconColor={this.props.color}
          className={className}
          fontWeights={this.props.fontWeights}
        />
      </li>
    );
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  };

  getCustomSuggestions = () => {
    const customSuggestions = [
      {
        name: i18next.t('add-place'),
        selectedIconId: 'favourite',
        color: this.props.color,
      },
    ];
    if (this.props.favourites.length === 0) {
      return customSuggestions;
    }
    return [
      ...customSuggestions,
      {
        name: i18next.t('edit'),
        selectedIconId: 'edit',
        iconColor: this.props.color,
        color: this.props.color,
      },
    ];
  };

  render() {
    const { onClickFavourite, isLoading, fontWeights } = this.props;
    const {
      listOpen,
      favourites,
      highlightedIndex,
      firstFavourite,
      secondFavourite,
    } = this.state;
    const expandIcon = this.props.favourites.length === 0 ? 'plus' : 'arrow';

    if (i18next.language !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }

    return (
      <div style={{ '--font-weight-bold': fontWeights.bold }}>
        <div className={styles['favourite-container']}>
          <FavouriteLocation
            text={
              (firstFavourite &&
                (firstFavourite.name ||
                  (firstFavourite.address &&
                    firstFavourite.address.split(',')[0]))) ||
              i18next.t('add-home')
            }
            label={(firstFavourite && firstFavourite.address) || ''}
            clickItem={() =>
              firstFavourite
                ? onClickFavourite(firstFavourite)
                : this.props.onAddHome()
            }
            iconId={
              firstFavourite && firstFavourite.selectedIconId
                ? FavouriteBar.FavouriteIconIdToNameMap[
                    firstFavourite.selectedIconId
                  ]
                : 'home'
            }
            isLoading={isLoading}
            color={this.props.color}
          />
          <FavouriteLocation
            text={
              (secondFavourite &&
                (secondFavourite.name ||
                  (secondFavourite.address &&
                    secondFavourite.address.split(',')[0]))) ||
              i18next.t('add-work')
            }
            label={(secondFavourite && secondFavourite.address) || ''}
            clickItem={() =>
              secondFavourite
                ? onClickFavourite(secondFavourite)
                : this.props.onAddWork()
            }
            iconId={
              secondFavourite && secondFavourite.selectedIconId
                ? FavouriteBar.FavouriteIconIdToNameMap[
                    secondFavourite.selectedIconId
                  ]
                : 'work'
            }
            isLoading={isLoading}
            color={this.props.color}
          />
          {/* eslint-disable jsx-a11y/role-supports-aria-props */}
          <div
            className={cx(styles.expandButton, styles[expandIcon], {
              [styles.rotate]: listOpen,
            })}
            ref={this.expandListRef}
            id="favourite-expand-button"
            onFocus={() => this.toggleList()}
            onKeyDown={e => this.handleKeyDown(e)}
            onClick={() => this.toggleList()}
            tabIndex="0"
            role="listbox"
            aria-label={i18next.t('open-favourites')}
            aria-owns={favourites
              .map((_, i) => `favourite-suggestion-list--item-${i}`)
              .join(' ')}
            aria-activedescendant={`favourite-suggestion-list--item-${highlightedIndex}`}
          >
            <Shimmer active={isLoading}>
              <Icon img={expandIcon} color={this.props.color} />
            </Shimmer>
          </div>
          {/* eslint-enable jsx-a11y/role-supports-aria-props */}
        </div>
        <div className={styles['favourite-suggestion-container']}>
          {listOpen && (
            <ul
              className={styles['favourite-suggestion-list']}
              id="favourite-suggestion-list"
              ref={this.suggestionListRef}
            >
              {favourites.map((item, index) =>
                this.renderSuggestion(
                  {
                    ...item,
                    address: item.address
                      ? item.address.replace(
                          new RegExp(`${escapeRegExp(item.name)}(,)?( )?`),
                          '',
                        )
                      : '',
                    iconColor: this.props.color,
                  },
                  index,
                ),
              )}
              {favourites.length > 0 && <div className={styles.divider} />}
              {this.getCustomSuggestions().map((item, index) =>
                this.renderSuggestion(
                  {
                    ...item,
                    iconColor: this.props.color,
                  },
                  favourites.length + index,
                  'favouriteCustom',
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default FavouriteBar;
