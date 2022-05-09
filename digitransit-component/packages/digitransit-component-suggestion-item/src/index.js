/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

const BUS_EXPRESS = 702;
const BUS_LOCAL = 999704;

const getRouteMode = props => {
  switch (props.type) {
    case BUS_LOCAL:
      return 'bus-local';
    case BUS_EXPRESS:
      return 'bus-express';
    default:
      return props?.mode?.toLowerCase() || 'bus';
  }
};

function isFavourite(item) {
  return item && item.type && item.type.includes('Favourite');
}

function getAriaDescription(ariaContentArray) {
  const description = ariaContentArray
    .filter(part => part !== undefined && part !== null && part !== '')
    .join(' ');
  return description;
}

function getIconProperties(item, color, modes = undefined, modeSet, stopCode) {
  let iconId;
  let iconColor = '#888888';
  // because of legacy favourites there might be selectedIconId for some stops or stations
  // but we do not want to show those icons
  if (item.type === 'FavouriteStop') {
    iconId = 'favouriteStop';
  } else if (item.type === 'FavouriteStation') {
    iconId = 'favouriteStation';
  } else if (item.type === 'Route') {
    const mode =
      modeSet === 'default'
        ? getRouteMode(item?.properties)
        : item?.properties?.mode?.toLowerCase() || 'bus';
    return modeSet === 'default'
      ? [`mode-${mode}`, `mode-${mode}`]
      : [`mode-${modeSet}-${mode}`, `mode-${mode}`];
  } else if (item.type === 'OldSearch' && item?.properties?.mode) {
    const mode =
      modeSet === 'default'
        ? getRouteMode(item?.properties)
        : item?.properties?.mode?.toLowerCase() || 'bus';
    return modeSet === 'default'
      ? [`mode-${mode}`, `mode-${mode}`]
      : [`mode-${modeSet}-${mode}`, `mode-${mode}`];
  } else if (item && item.selectedIconId) {
    iconId = item.selectedIconId;
  } else if (item && item.properties) {
    if (item.properties.layer === 'bikestation') {
      return [`citybike-stop-${modeSet}`, 'mode-citybike'];
    }
    iconId = item.properties.selectedIconId || item.properties.layer;
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
    ['BUS-default', { icon: 'search-bus-stop-default', color: 'mode-bus' }],
    [
      'BUS-EXPRESS-default',
      { icon: 'search-bus-stop-express-default', color: 'mode-bus-express' },
    ],
    [
      'BUS-digitransit',
      { icon: 'search-bus-stop-digitransit', color: 'mode-bus' },
    ],
    ['BUS-STATION-default', { icon: 'mode-bus', color: 'mode-bus' }],
    [
      'BUS-STATION-digitransit',
      { icon: 'search-bus-station-digitransit', color: 'mode-bus' },
    ],
    ['RAIL-default', { icon: 'search-rail-stop-default', color: 'mode-rail' }],
    [
      'RAIL-digitransit',
      { icon: 'search-rail-stop-digitransit', color: 'mode-rail' },
    ],
    ['RAIL-STATION-default', { icon: 'mode-rail', color: 'mode-rail' }],
    [
      'RAIL-STATION-digitransit',
      { icon: 'search-rail-station-digitransit', color: 'mode-rail' },
    ],
    ['TRAM-default', { icon: 'search-tram-stop-default', color: 'mode-tram' }],
    [
      'TRAM-digitransit',
      { icon: 'search-tram-stop-digitransit', color: 'mode-tram' },
    ],
    ['SUBWAY-default', { icon: 'subway', color: 'mode-metro' }],
    ['SUBWAY-digitransit', { icon: 'subway', color: 'mode-metro' }],
    ['SUBWAY-STATION-default', { icon: 'subway', color: 'mode-metro' }],
    ['SUBWAY-STATION-digitransit', { icon: 'subway', color: 'mode-metro' }],
    [
      'FERRY-STATION-default',
      { icon: 'search-ferry-default', color: 'mode-ferry' },
    ],
    [
      'FERRY-STATION-digitransit',
      { icon: 'search-ferry-digitransit', color: 'mode-ferry' },
    ],
    [
      'FERRY-default',
      { icon: 'search-ferry-stop-default', color: 'mode-ferry-pier' },
    ],
    [
      'FERRY-digitransit',
      { icon: 'search-ferry-stop-digitransit', color: 'mode-ferry-pier' },
    ],

    [
      'AIRPLANE-digitransit',
      { icon: 'search-airplane-digitransit', color: 'mode-airplane' },
    ],
    [
      'BUS-TRAM-STATION-digitransit',
      {
        icon: 'search-bustram-stop-digitransit',
        color: 'mode-tram',
      },
    ],
  ]);
  const defaultIcon = 'place';
  // Use more accurate icons in stop/station search, depending on mode from geocoding
  if (modes?.length) {
    const mode = modes[0];
    let iconStr;
    if (item.properties.layer === 'station' || (mode === 'FERRY' && stopCode)) {
      const iconProperties = layerIcon.get(
        mode.concat('-STATION').concat('-').concat(modeSet),
      );
      if (iconProperties) {
        iconStr = [iconProperties]; // layerIcon.get(mode.concat('-STATION').concat('-').concat(modeSet)),
      } else {
        iconStr = ['busstop', 'mode-bus'];
      }
    } else if (modes.includes('BUS-EXPRESS') && modeSet === 'default') {
      iconStr = [layerIcon.get('BUS-EXPRESS'.concat('-').concat(modeSet))];
    } else {
      iconStr = [layerIcon.get(mode.concat('-').concat(modeSet))];
    }
    let icon;
    if (Array.isArray(iconStr) && iconStr.filter(i => i).length > 0) {
      icon = iconStr[0].icon;
      iconColor = iconStr[0].color;
      if (!icon) {
        return ['busstop', 'mode-bus'];
      }
      return [icon, iconColor];
    }
    // If no icon's found, return default stop icon.
    return iconStr.filter(k => k).length ? iconStr : [layerIcon.get('stop')];
  }
  if (layerIcon.get(iconId) === 'locate') {
    iconColor = color;
  }
  return [layerIcon.get(iconId) || defaultIcon, iconColor];
}

/** *
 * Checks if stationId is a number. We don't want to display random hashes or names.
 *
 * @param stationId station's id, TODO we should probably support GBFS short_name
 */
function hasVehicleStationCode(stationId) {
  return (
    // eslint-disable-next-line no-restricted-globals
    !isNaN(stationId) &&
    // eslint-disable-next-line no-restricted-globals
    !isNaN(parseFloat(stationId))
  );
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
    accessiblePrimaryColor,
    fillInput,
    fontWeights,
    modeIconColors,
    modeSet = 'default',
  }) => {
    const [
      suggestionType,
      name,
      label,
      stopCode,
      modes,
      platform,
    ] = content || ['', item.name, item.address];

    const [iconId, iconColor] = getIconProperties(
      item,
      color,
      modes,
      modeSet,
      stopCode,
    );
    const modeIconColor = modeIconColors[iconColor] || modeIconColors[iconId];
    // Arrow clicked is for street. Instead of selecting item when a user clicks on arrow,
    // It fills the input field.
    const [arrowClicked, setArrowClicked] = useState(false);
    const icon = (
      <span
        className={`${styles[iconId]} ${item?.properties?.mode?.toLowerCase()}`}
      >
        <Icon color={modeIconColor || iconColor} img={iconId} />
      </span>
    );
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
      ? suggestionType.concat(
          item.properties.localadmin ? `, ${item.properties.localadmin}` : '',
        )
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
                  {((!isBikeRentalStation && stopCode && stopCode !== name) ||
                    (isBikeRentalStation &&
                      hasVehicleStationCode(
                        stopCode || item.properties.id,
                      ))) && (
                    <span className={styles['stop-code']}>
                      {stopCode || item.properties.id}
                    </span>
                  )}
                  {platform?.length === 2 && (
                    <>
                      {platform[0]}{' '}
                      <span className={styles.platform}>{platform[1]}</span>
                    </>
                  )}
                </div>
              </span>
            )}
          {(item.selectedIconId === 'favourite' || iconId === 'edit') && (
            <span>
              <div className={cx(styles['suggestion-name'], styles[className])}>
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
        style={{
          '--font-weight-medium': fontWeights.medium,
          '--accessible-primary-color': accessiblePrimaryColor,
        }}
      >
        {acri}
        {ri}
      </div>
    );
  },
);

SuggestionItem.propTypes = {
  item: PropTypes.object,
  content: PropTypes.array,
  className: PropTypes.string,
  isMobile: PropTypes.bool,
  color: PropTypes.string,
  accessiblePrimaryColor: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  modeIconColors: PropTypes.object,
  modeSet: PropTypes.string,
};

SuggestionItem.defaultProps = {
  className: undefined,
  isMobile: false,
  color: '#007ac9',
  accessiblePrimaryColor: '#0074be',
  fontWeights: {
    medium: 500,
  },
  modeIconColors: {
    'mode-bus': '#007ac9',
    'mode-rail': '#8c4799',
    'mode-tram': '#008151',
    'mode-metro': '#ed8c00',
    'mode-ferry': '#007A97',
    'mode-ferry-pier': '#666666',
    'mode-citybike': '#f2b62d',
    'mode-bus-express': '#CA4000',
    'mode-bus-local': '#007ac9',
  },
  modeSet: undefined,
};

export default SuggestionItem;
