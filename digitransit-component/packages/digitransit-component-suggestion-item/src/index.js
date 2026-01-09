/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React, { useState, memo } from 'react';
import cx from 'classnames';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

const extendedModes = {
  702: 'bus-express',
  704: 'bus-local',
  714: 'replacement-bus',
  900: 'speedtram',
};

const iconColors = {
  'mode-airplane': '#0046ad',
  'mode-bus': '#007ac9',
  'mode-bus-express': '#ca4000',
  'mode-bus-local': '#007ac9',
  'mode-replacement-bus': '#dc0451',
  'mode-rail': '#8c4799',
  'mode-tram': '#008151',
  'mode-speedtram': '#007e79',
  'mode-subway': '#ed8c00',
  'mode-ferry': '#007a97',
  'mode-ferry-external': '#666666',
  'mode-funicular': '#ff00ff',
  'mode-citybike': '#f2b62d',
  'mode-citybike-secondary': '#333333',
  'mode-bikepark': '#f2b62d',
  'mode-carpark': '#007ac9',
};

const getRouteMode = (props, set) => {
  let eMode;
  if (set === 'hsl') {
    eMode = extendedModes[props.type];
  }
  return eMode || props.mode?.toLowerCase() || 'bus';
};

const iconProps = {
  bikestation: ['citybike'],
  currentPosition: ['locate'],
  locality: ['city'],
  station: ['station'],
  localadmin: ['city'],
  neighbourhood: ['city'],
  edit: ['edit'],
  'icon-icon_home': ['home'],
  'icon-icon_work': ['work'],
  'icon-icon_sport': ['sport'],
  'icon-icon_school': ['school'],
  'icon-icon_shopping': ['shopping'],
  selectFromMap: ['map'],
  ownLocations: ['star'],
  back: ['arrow'],
  futureRoute: ['future-route'],

  // map unusual transport modes
  'subway-stop': ['subway', 'mode-subway'],
  'bus-express-hsl': ['bus-hsl', 'mode-bus-express'],
  'bus-express-stop-hsl': ['bus-stop-hsl', 'mode-bus-express'],
  'bus-express-digitransit': ['bus-digitransit', 'mode-bus'],
  'bus-express-stop-digitransit': ['bus-stop-digitransit', 'mode-bus'],
  'speedtram-digitransit': ['mode-tram', 'mode-tram'],
  'speedtram-stop-digitransit': ['tram-stop-digitransit', 'mode-tram'],
  'ferry-stop-hsl': ['ferry-stop-hsl', 'mode-ferry-external'],
  'ferry-stop-digitransit': ['ferry-stop-digitransit', 'mode-ferry-external'],
  'bus-tram-stop-digitransit': ['bustram-stop-digitransit', 'mode-tram'],
};

function isFavourite(item) {
  return item.type?.includes('Favourite');
}

function getAriaDescription(ariaContentArray) {
  const description = ariaContentArray
    .filter(part => part !== undefined && part !== null && part !== '')
    .join(' ');
  return description?.toLowerCase();
}

const stopLayers = ['station', 'stop'];
const parkLayers = ['bikepark', 'carpark'];
const noTheme = ['subway', 'airplane', 'funicular']; // common icon in all themes

function getIconProps(mode, isStop, modeSet) {
  // select stop lollipop or mode/station icon
  const stopDesc = isStop ? '-stop' : '';
  // is the icon theme specific
  const themePostfix = noTheme.includes(mode) ? '' : `-${modeSet}`;
  return (
    iconProps[`${mode}${stopDesc}${themePostfix}`] || [
      `${mode}${stopDesc}${themePostfix}`,
      `mode-${mode}`,
    ]
  );
}

function getIconProperties(item, modeSet, stopCode, modes) {
  let iconId;

  // because of legacy favourites there might be selectedIconId for some stops or stations
  // but we do not want to show those icons
  if (isFavourite(item)) {
    return ['star'];
  }
  if (
    item.type === 'Route' ||
    (item.type === 'OldSearch' && item.properties?.mode)
  ) {
    const mode = getRouteMode(item.properties, modeSet);
    return getIconProps(mode, false, modeSet);
  }
  if (item.selectedIconId) {
    iconId = item.selectedIconId;
  } else if (item.properties) {
    if (item.properties.layer === 'bikestation') {
      return [`citybike-stop-${modeSet}`, 'mode-citybike'];
    }
    if (parkLayers.includes(item.properties.layer)) {
      return [item.properties.layer, `mode-${item.properties.layer}`];
    }
    if (
      item.properties.label?.split(',').length === 1 &&
      !isFavourite(item) &&
      !stopLayers.includes(item.properties.layer)
    ) {
      return ['city'];
    }
    iconId = item.properties.layer;
  }
  // Use more accurate icons in stop/station search, depending on mode from geocoding
  if (modes?.length) {
    let station = item.properties.layer === 'station';
    let mode; // select dominating mode
    if (modes.includes('SPEEDTRAM')) {
      mode = 'speedtram';
    } else if (modes.includes('BUS-EXPRESS' && !station)) {
      mode = 'bus-express';
    } else {
      mode = modes[0].toLowerCase();
    }
    station = station || (mode === 'ferry' && stopCode);

    return getIconProps(mode, !station, modeSet);
  }
  return iconProps[iconId] || ['place'];
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
const SuggestionItem = memo(
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
    getAutoSuggestIcons,
    modeSet,
  }) => {
    const [suggestionType, name, label, stopCode, modes, platform] =
      content || ['', item.name, item.address];

    let iconId;
    let iconColor;
    if (
      item.properties?.layer &&
      getAutoSuggestIcons?.[item.properties?.layer]
    ) {
      [iconId, iconColor] = getAutoSuggestIcons[item.properties.layer](item);
    } else {
      let colorId;
      [iconId, colorId] = getIconProperties(item, modeSet, stopCode, modes);
      if (item.properties?.color) {
        iconColor = `#${item.properties.color}`;
      } else if (iconId === 'locate' || isFavourite(item)) {
        iconColor = color;
      } else {
        iconColor = modeIconColors?.[colorId] || iconColors[colorId] || '#888';
      }
    }
    // console.log(item, iconId, iconColor);
    // Arrow clicked is for street. Instead of selecting item when a user clicks on arrow,
    // It fills the input field.
    const [arrowClicked, setArrowClicked] = useState(false);

    const icon = (
      <span
        className={`${styles[iconId]} ${item.properties?.mode?.toLowerCase()}`}
      >
        <Icon color={iconColor} img={iconId} />
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
    const isVehicleRentalStation =
      item.properties?.layer === 'favouriteVehicleRentalStation' ||
      item.properties?.layer === 'bikestation';
    const isParkingArea =
      item.properties?.layer === 'carpark' ||
      item.properties?.layer === 'bikepark';
    const labelWithLocationType =
      isVehicleRentalStation || isParkingArea
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
                  aria-hidden="true"
                  className={cx(styles['suggestion-name'], styles[className])}
                >
                  {name}
                </div>
                <div className={styles['suggestion-label']}>
                  {isVehicleRentalStation || isParkingArea
                    ? labelWithLocationType
                    : label}{' '}
                  {((!isVehicleRentalStation &&
                    stopCode &&
                    stopCode !== name) ||
                    (isVehicleRentalStation &&
                      hasVehicleStationCode(
                        stopCode || item.properties.id,
                      ))) && (
                    <span className={styles['stop-code']}>
                      {stopCode || item.properties.id}
                    </span>
                  )}
                  {platform?.length === 2 && (
                    <>
                      {platform[0].toLowerCase()}{' '}
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
                  {item.properties.origin.localadmin
                    ? `, ${item.properties.origin.localadmin.split('*')[0]}`
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
                  {item.properties.destination.localadmin
                    ? `, ${
                        item.properties.destination.localadmin.split('*')[0]
                      }`
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
          (item.properties?.layer !== 'street' ||
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
          item.properties?.layer === 'street' &&
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
  item: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    address: PropTypes.string,
    selectedIconId: PropTypes.string,
    translatedText: PropTypes.string,
    properties: PropTypes.shape({
      layer: PropTypes.string,
      color: PropTypes.string,
      localadmin: PropTypes.string,
      mode: PropTypes.string,
      id: PropTypes.string,
      source: PropTypes.string,
      arrowClicked: PropTypes.bool,
      destination: PropTypes.shape({
        name: PropTypes.string,
        localadmin: PropTypes.string,
      }),
      origin: PropTypes.shape({
        name: PropTypes.string,
        localadmin: PropTypes.string,
      }),
    }),
  }).isRequired,
  // eslint-disable-next-line
  content: PropTypes.array,
  className: PropTypes.string,
  isMobile: PropTypes.bool,
  ariaFavouriteString: PropTypes.string,
  loading: PropTypes.bool,
  fillInput: PropTypes.func,
  color: PropTypes.string,
  accessiblePrimaryColor: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  getAutoSuggestIcons: PropTypes.objectOf(PropTypes.func),
  modeIconColors: PropTypes.objectOf(PropTypes.string),
  modeSet: PropTypes.string,
};

SuggestionItem.defaultProps = {
  loading: false,
  ariaFavouriteString: '',
  fillInput: () => {},
  className: undefined,
  isMobile: false,
  color: '#007ac9',
  accessiblePrimaryColor: '#0074be',
  fontWeights: {
    medium: 500,
  },
  modeIconColors: undefined,
  getAutoSuggestIcons: {
    citybikes: station => {
      const name =
        station.properties.source === 'citybikesvantaa'
          ? 'citybike-stop-hsl-secondary'
          : 'citybike-stop-hsl';
      return [name, iconColors['mode-citybike']];
    },
  },
  modeSet: 'hsl',
};

export default SuggestionItem;
