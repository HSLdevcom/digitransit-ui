import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import Shimmer from '@hsl-fi/shimmer';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import Icon from '@digitransit-component/digitransit-component-icon';
import { formatFavouritePlaceLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
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
    <button
      type="button"
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
    </button>
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
      medium: PropTypes.number,
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
      medium: 500,
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
      firstFavourite: props.favourites[0] || null,
      secondFavourite: props.favourites[1] || null,
      favourites: props.favourites.slice(2, props.favourites.length),
      timestamp: 0,
    };
    this.expandListRef = React.createRef();
    this.suggestionListRef = React.createRef();
    this.firstItemRef = React.createRef();
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
      this.setState(
        prevState => ({
          listOpen: !prevState.listOpen,
          timestamp: new Date().getTime(),
        }),
        () => {
          if (this.state.listOpen) {
            this.firstItemRef.current?.focus();
          } else {
            this.expandListRef.current?.focus();
          }
        },
      );
    }
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

  suggestionSelected = index => {
    const { favourites } = this.state;
    if (index < favourites.length) {
      this.props.onClickFavourite(favourites[index]);
    } else if (index === favourites.length) {
      this.props.onAddPlace();
    } else if (index === favourites.length + 1) {
      this.props.onEdit();
    }
    this.toggleList();
  };

  handleKeyDown = (event, index) => {
    const { listOpen, favourites } = this.state;
    const key = (event && (event.key || event.which || event.keyCode)) || '';
    if (isKeyboardSelectionEvent(event)) {
      if (!listOpen) {
        this.toggleList();
      } else {
        this.suggestionSelected(index);
      }
    } else if (key === 'Escape' || key === 27) {
      if (listOpen) {
        this.toggleList();
      }
    } else if (
      key === 'Tab' &&
      !event.shiftKey &&
      index === favourites.length + this.getCustomSuggestions().length - 1
    ) {
      this.setState({ listOpen: false });
    }
  };

  renderSuggestion = (
    item,
    index,
    ariaLabelSuffix = '',
    className = undefined,
  ) => {
    const id = `favourite-suggestion-list--item-${index}`;
    return (
      <li>
        <div
          role="button"
          type="button"
          tabIndex="0"
          key={`favourite-suggestion-item-${index}`}
          id={id}
          className={cx(styles['favourite-suggestion-item'])}
          onClick={() => this.suggestionSelected(index)}
          onKeyDown={e => this.handleKeyDown(e, index)}
          ref={index === 0 ? this.firstItemRef : ''}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={index === 0}
          aria-label={`${item?.name || ''} ${
            item?.address || ''
          } ${ariaLabelSuffix}`}
        >
          <SuggestionItem
            item={item}
            iconColor={this.props.color}
            className={className}
            fontWeights={this.props.fontWeights}
          />
        </div>
      </li>
    );
  };

  getCustomSuggestions = () => {
    const customSuggestions = [
      {
        name: i18next.t('add-place'),
        selectedIconId: 'favourite',
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
      },
    ];
  };

  render() {
    const { onClickFavourite, isLoading, fontWeights } = this.props;
    const {
      listOpen,
      favourites,
      firstFavourite,
      secondFavourite,
    } = this.state;
    const expandIcon = this.props.favourites.length === 0 ? 'plus' : 'arrow';

    if (i18next.language !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }

    const [name1, address1] = formatFavourite(firstFavourite);
    const [name2, address2] = formatFavourite(secondFavourite);

    return (
      <div style={{ '--font-weight-medium': fontWeights.medium }}>
        <div className={styles['favourite-container']}>
          <FavouriteLocation
            text={name1 || i18next.t('add-home')}
            label={address1 || ''}
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
            text={name2 || i18next.t('add-work')}
            label={address2 || ''}
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
          <button
            type="button"
            className={cx(styles.expandButton, styles[expandIcon], {
              [styles.rotate]: listOpen,
            })}
            ref={this.expandListRef}
            id="favourite-expand-button"
            onKeyDown={e => this.handleKeyDown(e)}
            onClick={() => this.toggleList()}
            aria-haspopup
            aria-pressed={this.state.listOpen}
            aria-label={i18next.t('open-favourites')}
          >
            <Shimmer active={isLoading}>
              <Icon img={expandIcon} color={this.props.color} />
            </Shimmer>
          </button>
          {/* eslint-enable jsx-a11y/role-supports-aria-props */}
        </div>
        <div className={styles['favourite-suggestion-container']}>
          {listOpen && (
            <ul
              className={styles['favourite-suggestion-list']}
              id="favourite-suggestion-list"
              ref={this.suggestionListRef}
              aria-label={i18next.t('favourites-list')}
            >
              {favourites.map((item, index) => {
                const favouriteLabel = formatFavouritePlaceLabel(
                  item.name,
                  item.address,
                );
                const address = favouriteLabel[1];

                return this.renderSuggestion(
                  {
                    ...item,
                    address,
                    iconColor: this.props.color,
                  },
                  index,
                  `, ${i18next.t('add-destination')}`,
                );
              })}
              {favourites.length > 0 && (
                <div aria-hidden className={styles.divider} />
              )}
              {this.getCustomSuggestions().map((item, index) =>
                this.renderSuggestion(
                  {
                    ...item,
                    iconColor: this.props.color,
                  },
                  favourites.length + index,
                  undefined,
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
