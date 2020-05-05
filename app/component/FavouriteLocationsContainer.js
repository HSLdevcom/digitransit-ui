import PropTypes from 'prop-types';
import React from 'react';
import find from 'lodash/find';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from './Icon';
import FavouriteLocation from './FavouriteLocation';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';
import SuggestionItem from './SuggestionItem';
import { isKeyboardSelectionEvent } from '../util/browser';

const CustomSuggestionItem = pure(({ item, suggestionProps }) => {
  const { id, selected, onMouseEnter, index } = suggestionProps;
  const { text, iconId, color } = item;
  return (
    <li
      id={id}
      className={cx(
        'favourite-suggestion-item',
        'custom',
        selected ? 'highlighted' : '',
      )}
      onMouseEnter={() => onMouseEnter(index)}
      role="option"
      aria-selected={selected}
      aria-label={text}
    >
      <div className="search-result">
        <span className="autosuggestIcon">
          <Icon img={iconId} color={color} />
        </span>
        <span className="use-own-position">{text}</span>
      </div>
    </li>
  );
});

export default class FavouriteLocationsContainer extends React.Component {
  static propTypes = {
    favourites: PropTypes.array.isRequired,
    onClickFavourite: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      listOpen: false,
      highlightedIndex: 0,
      favourites: [],
      home: null,
      work: null,
    };
    this.expandListRef = React.createRef();
    this.suggestionListRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    const { favourites } = this.props;
    const home = find(
      favourites,
      favourite => favourite.name === 'Home' || favourite.name === 'Koti',
    );
    const work = find(
      favourites,
      favourite => favourite.name === 'Work' || favourite.name === 'Työ',
    );
    const filteredFavourites = favourites.filter(
      favourite =>
        favourite.favouriteId !== (home && home.favouriteId) &&
        favourite.favouriteId !== (work && work.favouriteId),
    );
    this.setState({ favourites: filteredFavourites, home, work });
  }

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

  clickFavourite = favourite => {
    return Promise.resolve(this.props.onClickFavourite(favourite)).then(() =>
      this.toggleList(),
    );
  };

  handleKeyDown = event => {
    const { favourites, highlightedIndex, listOpen } = this.state;
    const key = (event && (event.key || event.which || event.keyCode)) || '';
    if (isKeyboardSelectionEvent(event)) {
      if (!listOpen) {
        this.toggleList();
      } else if (highlightedIndex < favourites.length) {
        this.clickFavourite(favourites[highlightedIndex]);
      } else if (highlightedIndex === favourites.length) {
        this.toggleList();
      } else if (highlightedIndex === favourites.length + 1) {
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

  renderSuggestion = (item, index) => {
    const { highlightedIndex, favourites } = this.state;
    const id = `favourite-suggestion-list--item-${index}`;
    const selected = highlightedIndex === index;
    const suggestionProps = {
      id,
      index,
      selected,
      onMouseEnter: this.highlightSuggestion,
      onClickSuggestion: this.clickFavourite,
    };
    return (
      <React.Fragment key={`favourite-suggestion-item-${index}`}>
        {index < favourites.length && (
          <SuggestionItem
            ref={item.name}
            item={item}
            suggestionProps={suggestionProps}
            isFavourite
          />
        )}
        {index >= favourites.length && (
          <CustomSuggestionItem item={item} suggestionProps={suggestionProps} />
        )}
      </React.Fragment>
    );
  };

  render() {
    const { onClickFavourite } = this.props;
    const { listOpen, favourites, home, work, highlightedIndex } = this.state;

    const expandIcon =
      favourites.length === 0 ? 'icon-icon_plus' : 'icon-icon_arrow-dropdown';

    const customSuggestions = [
      { text: 'Lisää paikka', iconId: 'icon-icon_star', color: '#007ac9' },
      { text: 'Muokkaa', iconId: 'icon-icon_edit', color: '#007ac9' },
    ];
    /* eslint-disable anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/role-supports-aria-props */
    return (
      <React.Fragment>
        <div className="new-favourite-locations-container">
          {!home && (
            <EmptyFavouriteLocationSlot
              index={0}
              text="add-home"
              defaultMessage="Add home"
              iconId="icon-icon_home"
            />
          )}
          {home && (
            <FavouriteLocation
              favourite={home}
              clickFavourite={onClickFavourite}
            />
          )}
          {!work && (
            <EmptyFavouriteLocationSlot
              index={1}
              text="add-work"
              defaultMessage="Add work"
              iconId="icon-icon_work"
            />
          )}
          {work && (
            <FavouriteLocation
              favourite={work}
              clickFavourite={onClickFavourite}
            />
          )}
          <div
            className="favourite-container-expand"
            ref={this.expandListRef}
            id="favourite-expand-button"
            onClick={() => this.toggleList()}
            onKeyDown={e => this.handleKeyDown(e)}
            tabIndex="0"
            role="button"
            aria-label="Expand favourites"
            aria-controls="favourite-suggestion-list"
            aria-activedescendant={`favourite-suggestion-list--item-${highlightedIndex}`}
          >
            <Icon className="favourite-expand-icon" img={expandIcon} />
          </div>
        </div>
        <div className="favourite-suggestion-container">
          {listOpen && (
            <ul
              className="favourite-suggestion-list"
              id="favourite-suggestion-list"
              ref={this.suggestionListRef}
              role="listbox"
            >
              {favourites.map((item, index) =>
                this.renderSuggestion(item, index),
              )}
              {favourites.length > 0 && <div className="separator-line" />}
              {customSuggestions.map((item, index) =>
                this.renderSuggestion(item, favourites.length + index),
              )}
            </ul>
          )}
        </div>
      </React.Fragment>
    );
  }
}
