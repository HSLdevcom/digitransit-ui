import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import escapeRegExp from 'lodash/escapeRegExp';
import SuggestionItem from '@digitransit-component/digitransit-component-suggestion-item';
import Icon from '@digitransit-component/digitransit-component-icon';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

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

const FavouriteLocation = ({ className, clickItem, iconId, text, label }) => {
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      className={cx(styles['favourite-content'], styles[className])}
      onKeyPress={e => isKeyboardSelectionEvent(e) && clickItem}
      onClick={clickItem}
      tabIndex="0"
      aria-label={text}
    >
      <span className={cx(styles.icon, styles[iconId])}>
        <Icon img={iconId} />
      </span>
      <div className={styles['favourite-location']}>
        <div className={styles.name}>{text}</div>
        <div className={styles.address}>{label}</div>
      </div>
    </div>
  );
};

FavouriteLocation.propTypes = {
  clickItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconId: PropTypes.string,
  text: PropTypes.string,
  label: PropTypes.string,
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
  };

  static defaultProps = {
    onClickFavourite: () => ({}),
    onAddPlace: () => ({}),
    onEdit: () => ({}),
    onAddHome: () => ({}),
    onAddWork: () => ({}),
    lang: 'fi',
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
    };
    this.expandListRef = React.createRef();
    this.suggestionListRef = React.createRef();
  }

  componentDidMount() {
    i18next.changeLanguage(this.props.lang);
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { favourites } = prevState;
    const nextFavourites = nextProps.favourites;
    if (
      !isEmpty(differenceWith(nextFavourites, favourites, isEqual)) ||
      !isEmpty(differenceWith(favourites, nextFavourites, isEqual)) ||
      !isEqual(nextFavourites, favourites)
    ) {
      return {
        firstFavourite: nextFavourites[0] || null,
        secondFavourite: nextFavourites[1] || null,
        favourites: nextFavourites.slice(2, nextFavourites.length),
      };
    }
    return null;
  }

  componentDidUpdate = prevProps => {
    if (prevProps.lang !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  toggleList = () => {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
      highlightedIndex: 0,
    }));
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
        <SuggestionItem item={item} iconColor="#007ac9" className={className} />
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
        iconColor: '#007ac9',
      },
    ];
  };

  render() {
    const { onClickFavourite } = this.props;
    const {
      listOpen,
      favourites,
      highlightedIndex,
      firstFavourite,
      secondFavourite,
    } = this.state;
    const expandIcon = this.props.favourites.length === 0 ? 'plus' : 'arrow';
    /* eslint-disable anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/role-supports-aria-props */
    return (
      <React.Fragment>
        <div className={styles['favourite-container']}>
          <FavouriteLocation
            text={
              (firstFavourite && firstFavourite.name) || i18next.t('add-home')
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
          />
          <FavouriteLocation
            text={
              (secondFavourite && secondFavourite.name) || i18next.t('add-work')
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
          />
          <div
            className={cx(styles.expandButton, styles[expandIcon])}
            ref={this.expandListRef}
            id="favourite-expand-button"
            onClick={() => this.toggleList()}
            onKeyDown={e => this.handleKeyDown(e)}
            tabIndex="0"
            role="button"
            aria-label={i18next.t('open-favourites')}
            aria-controls="favourite-suggestion-list"
            aria-activedescendant={`favourite-suggestion-list--item-${highlightedIndex}`}
          >
            <Icon img={expandIcon} rotate={listOpen ? -90 : 90} />
          </div>
        </div>
        <div className={styles['favourite-suggestion-container']}>
          {listOpen && (
            <ul
              className={styles['favourite-suggestion-list']}
              id="favourite-suggestion-list"
              ref={this.suggestionListRef}
              role="listbox"
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
                    iconColor: '#007ac9',
                  },
                  index,
                ),
              )}
              {favourites.length > 0 && <div className={styles.divider} />}
              {this.getCustomSuggestions().map((item, index) =>
                this.renderSuggestion(
                  item,
                  favourites.length + index,
                  'favouriteCustom',
                ),
              )}
            </ul>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default FavouriteBar;
