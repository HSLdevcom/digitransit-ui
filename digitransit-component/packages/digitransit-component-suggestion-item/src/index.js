/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

function getIconProperties(item) {
  let iconId;
  let iconColor = '#888888';
  if (item && item.selectedIconId) {
    iconId = item.selectedIconId;
  } else if (item && item.properties) {
    iconId = item.properties.selectedIconId || item.properties.layer;
  }
  if (item && item.iconColor) {
    // eslint-disable-next-line prefer-destructuring
    iconColor = item.iconColor;
  } else if (
    item &&
    item.properties &&
    item.properties.layer.includes('favourite')
  ) {
    iconColor = '#007ac9';
  }
  const layerIcon = new Map([
    ['bikeRentalStation', 'citybike'],
    ['currentPosition', 'locate'],
    ['favouritePlace', 'star'],
    ['favouriteRoute', 'star'],
    ['favouriteStop', 'star'],
    ['favouriteStation', 'star'],
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
  ({ item, content, loading, className, isMobile }) => {
    const [iconId, iconColor] = getIconProperties(item);
    const icon = (
      <span className={styles[iconId]}>
        <Icon color={iconColor} img={iconId} />
      </span>
    );
    const [suggestionType, name, label, stopCode] = content || [
      iconId,
      item.name,
      item.address,
    ];
    const acri = (
      <div className={styles['sr-only']}>
        <p>
          {' '}
          {suggestionType} - {name} - {stopCode} - {label}
        </p>
      </div>
    );
    const isFutureRoute = iconId === 'future-route';
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
          {iconId !== 'future-route' && (
            <span>
              <p className={cx(styles['suggestion-name'], styles[className])}>
                {name}
              </p>
              <p className={styles['suggestion-label']}>
                {stopCode &&
                  (item.type === 'Feature' ||
                    item.type === 'FavouriteStop') && (
                    <span className={styles['stop-code']}>{stopCode}</span>
                  )}
                {label || suggestionType}
                {stopCode && item.type === 'BikeRentalStation' && (
                  <span className={styles['bike-rental-id']}>{stopCode}</span>
                )}
              </p>
            </span>
          )}
          {iconId === 'future-route' && (
            <div>
              <p
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
                  , {item.properties.origin.locality}
                </span>
              </p>
              <p
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
                  , {item.properties.destination.locality}
                </span>
              </p>
              <p
                className={cx(styles['suggestion-label'], {
                  [styles.futureroute]: isFutureRoute,
                })}
              >
                {item.translatedText}
              </p>
            </div>
          )}
        </div>
        {iconId !== 'arrow' && (
          <span
            className={cx(styles['arrow-icon'], {
              [styles.mobile]: isMobile,
            })}
          >
            <Icon img="arrow" />
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
};

SuggestionItem.defaultProps = {
  className: undefined,
  isMobile: false,
};

export default SuggestionItem;
