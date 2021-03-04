/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

function isFavourite(item) {
  return item && item.type && item.type.includes('Favourite');
}

function getAriaDescription(ariaContentArray) {
  const description = ariaContentArray
    .filter(part => part !== undefined && part !== null && part !== '')
    .join(' ');
  return description;
}

function getIconProperties(item, color) {
  let iconId;
  let iconColor = '#888888';
  // because of legacy favourites there might be selectedIconId for some stops or stations
  // but we do not want to show those icons
  if (item.type === 'FavouriteStop') {
    iconId = 'favouriteStop';
  } else if (item.type === 'FavouriteStation') {
    iconId = 'favouriteStation';
  } else if (item && item.selectedIconId) {
    iconId = item.selectedIconId;
  } else if (item && item.properties) {
    iconId = item.properties.selectedIconId || item.properties.layer;
  } else if (item && item.properties.layer === 'bikestation') {
    iconId = 'citybike';
  }
  if (item && item.iconColor) {
    // eslint-disable-next-line prefer-destructuring
    iconColor = item.iconColor;
  } else if (isFavourite(item)) {
    iconColor = color;
  }
  const layerIcon = new Map([
    ['bikeRentalStation', 'citybike'],
    ['bikestation', 'citybike'],
    ['currentPosition', 'locate'],
    ['favouritePlace', 'star'],
    ['favouriteRoute', 'star'],
    ['favouriteStop', 'star'],
    ['favouriteStation', 'star'],
    ['favouriteBikeRentalStation', 'star'],
    ['favourite', 'star'],
    ['address', 'place'],
    ['stop', 'busstop'],
    ['locality', 'city'],
    ['station', 'station'],
    ['localadmin', 'city'],
    ['neighbourhood', 'city'],
    ['route-BUS', 'mode-bus'],
    ['route-TRAM', 'mode-tram'],
    ['route-RAIL', 'mode-rail'],
    ['route-SUBWAY', 'subway'],
    ['route-FERRY', 'mode-ferry'],
    ['route-AIRPLANE', 'airplane'],
    ['edit', 'edit'],
    ['icon-icon_home', 'home'],
    ['icon-icon_work', 'work'],
    ['icon-icon_sport', 'sport'],
    ['icon-icon_school', 'school'],
    ['icon-icon_shopping', 'shopping'],
    ['selectFromMap', 'select-from-map'],
    ['ownLocations', 'star'],
    ['back', 'arrow'],
    ['futureRoute', 'future-route'],
  ]);
  const defaultIcon = 'place';
  if (layerIcon.get(iconId) === 'locate') {
    iconColor = color;
  }
  return [layerIcon.get(iconId) || defaultIcon, iconColor];
}

/**
 * SuggestionItem renders suggestions for digitransit-autosuggest component.
 * @example
 * <SuggestionItem
 *    item={suggestionObject}
 *    content={['Pysäkki', 'Kuusitie', 'Helsinki', 'H1923']}
 *    loading={false}
 * />
 */
const SuggestionItem = pure(
  ({
    item,
    content,
    loading,
    className,
    isMobile,
    ariaFavouriteString,
    color,
    fillInput,
  }) => {
    const [iconId, iconColor] = getIconProperties(item, color);
    // Arrow clicked is for street itmes. Instead of selecting item when a user clicks on arrow,
    // It fills the input field.
    const [arrowClicked, setArrowClicked] = useState(false);

    const icon = (
      <span className={styles[iconId]}>
        <Icon color={iconColor} img={iconId} />
      </span>
    );
    const [suggestionType, name, label, stopCode] = content || [
      '',
      item.name,
      item.address,
    ];

    let ariaParts;
    if (name !== stopCode) {
      ariaParts = isFavourite(item)
        ? [ariaFavouriteString, suggestionType, name, stopCode, label]
        : [suggestionType, name, stopCode, label];
    } else {
      ariaParts = isFavourite(item)
        ? [ariaFavouriteString, suggestionType, name, label]
        : [suggestionType, name, label];
    }
    const ariaDescription = getAriaDescription(ariaParts);
    const acri = (
      <div className={styles['sr-only']}>
        <p>{ariaDescription}</p>
      </div>
    );
    const isFutureRoute = iconId === 'future-route';
    const isBikeRentalStation =
      item.properties &&
      (item.properties.layer === 'bikeRentalStation' ||
        item.properties.layer === 'favouriteBikeRentalStation' ||
        item.properties.layer === 'bikestation');
    const cityBikeLabel = isBikeRentalStation
      ? suggestionType.concat(', ').concat(item.properties.localadmin)
      : label;
    const ri = (
      <div
        aria-hidden="true"
        className={cx(
          styles['search-result'],
          {
            loading,
          },
          {
            [styles.futureroute]: isFutureRoute,
          },
        )}
      >
        <span aria-label={suggestionType} className={styles['suggestion-icon']}>
          {icon}
        </span>
        <div
          className={cx(styles['suggestion-result'], {
            [styles.futureroute]: isFutureRoute,
          })}
        >
          {iconId !== 'future-route' &&
            item.selectedIconId !== 'favourite' &&
            iconId !== 'edit' && (
              <span>
                <div
                  className={cx(styles['suggestion-name'], styles[className])}
                >
                  {name}
                </div>
                <div className={styles['suggestion-label']}>
                  {isBikeRentalStation ? cityBikeLabel : label}
                  {((stopCode && stopCode !== name) ||
                    item.properties.layer === 'bikestation') && (
                    <span className={styles['stop-code']}>
                      {stopCode || item.properties.id}
                    </span>
                  )}
                </div>
              </span>
            )}
          {(item.selectedIconId === 'favourite' || iconId === 'edit') && (
            <span>
              <div
                className={cx(styles['suggestion-name'], styles[className])}
                style={{ color: `${item.color}` }}
              >
                {name}
              </div>
            </span>
          )}
          {iconId === 'future-route' && (
            <div>
              <div
                className={cx(
                  styles['suggestion-name'],
                  styles.futureroute,
                  styles[className],
                )}
              >
                {item.properties.origin.name}
                <span
                  className={cx(
                    styles['suggestion-name'],
                    styles.futureroute,
                    styles.normal,
                    styles[className],
                  )}
                >
                  {item.properties.origin.locality
                    ? `, ${item.properties.origin.locality}`
                    : ''}
                </span>
              </div>
              <div
                className={cx(
                  styles['suggestion-name'],
                  styles.futureroute,
                  styles[className],
                )}
              >
                {item.properties.destination.name}
                <span
                  className={cx(
                    styles['suggestion-name'],
                    styles.futureroute,
                    styles.normal,
                    styles[className],
                  )}
                >
                  {item.properties.destination.locality
                    ? `, ${item.properties.destination.locality}`
                    : ''}
                </span>
              </div>
              <div
                className={cx(styles['suggestion-label'], {
                  [styles.futureroute]: isFutureRoute,
                })}
              >
                {item.translatedText}
              </div>
            </div>
          )}
        </div>
        {iconId !== 'arrow' &&
          (item?.properties?.layer !== 'street' ||
            !isMobile ||
            arrowClicked) && (
            <span
              className={cx(styles['arrow-icon'], {
                [styles.mobile]: isMobile,
              })}
            >
              <Icon img="arrow" color={iconColor} />
            </span>
          )}
        {iconId !== 'arrow' &&
          item?.properties?.layer === 'street' &&
          !arrowClicked &&
          isMobile && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
            <span
              className={cx(styles['arrow-icon'], {
                [styles.mobile]: isMobile,
                [styles['fill-input']]: !arrowClicked,
              })}
              onClick={() => {
                // Input is already filled for this item, no need
                // To fill it again
                if (arrowClicked) {
                  return;
                }
                setArrowClicked(true);
                // eslint-disable-next-line no-param-reassign
                item.properties.arrowClicked = true;
                fillInput(item);
              }}
            >
              <Icon img="search-street-name" color={iconColor} />
            </span>
          )}
      </div>
    );
    return (
      <div
        className={cx(
          styles['suggestion-item-container'],
          {
            [styles.mobile]: isMobile,
          },
          styles[item.type],
          {
            [styles.futureroute]: isFutureRoute,
          },
        )}
      >
        {acri}
        {ri}
      </div>
    );
  },
);

SuggestionItem.propTypes = {
  item: PropTypes.object,
  content: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  isMobile: PropTypes.bool,
  color: PropTypes.string,
};

SuggestionItem.defaultProps = {
  className: undefined,
  isMobile: false,
  color: '#007ac9',
};

export default SuggestionItem;
