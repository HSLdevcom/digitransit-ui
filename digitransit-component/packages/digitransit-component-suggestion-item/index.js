/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';

function getIcon(layer) {
  const layerIcon = new Map([
    ['currentPosition', 'icon-icon_locate'],
    ['favouritePlace', 'icon-icon_star'],
    ['favouriteRoute', 'icon-icon_star'],
    ['favouriteStop', 'icon-icon_star'],
    ['favouriteStation', 'icon-icon_star'],
    ['favourite', 'icon-icon_star'],
    ['address', 'icon-icon_place'],
    ['stop', 'icon-icon_bus-stop'],
    ['locality', 'icon-icon_city'],
    ['station', 'icon-icon_station'],
    ['localadmin', 'icon-icon_city'],
    ['neighbourhood', 'icon-icon_city'],
    ['route-BUS', 'icon-icon_bus-withoutBox'],
    ['route-TRAM', 'icon-icon_tram-withoutBox'],
    ['route-RAIL', 'icon-icon_rail-withoutBox'],
    ['route-SUBWAY', 'icon-icon_subway-withoutBox'],
    ['route-FERRY', 'icon-icon_ferry-withoutBox'],
    ['route-AIRPLANE', 'icon-icon_airplane-withoutBox'],
  ]);

  const defaultIcon = 'icon-icon_place';
  return layerIcon.get(layer) || defaultIcon;
}

function Icon({ color, img, height, width, margin }) {
  return (
    <span aria-hidden className="icon-container">
      <svg
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
          marginRight: margin ? `${margin}em` : null,
        }}
      >
        <use xlinkHref={`#${img}`} />
      </svg>
    </span>
  );
}

Icon.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  margin: PropTypes.number,
  width: PropTypes.number,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

/**
 * SuggestionItem renders suggestions for digitransit-autosuggest component.
 * @example
 * <SuggestionItem
 *    item={suggestionObject}
 * />
 */
const SuggestionItem = pure(({ item, ariaContent }) => {
  const icon = (
    <Icon
      width={1.2}
      height={1.2}
      color="#007ac9"
      img={getIcon(item.properties.layer)}
    />
  );

  const [iconstr, name, label] = ariaContent;
  const acri = (
    <div className="sr-only">
      <p>
        {' '}
        {iconstr} - {name} - {label}
      </p>
    </div>
  );
  const ri = (
    <div
      aria-hidden="true"
      className={cx('search-result', item.type, {
        favourite: item.type.startsWith('Favourite'),
      })}
    >
      <span aria-label={iconstr} className="autosuggestIcon">
        {icon}
      </span>
      <div>
        <p className="suggestion-name">{name}</p>
        <p className="suggestion-label">{label}</p>
      </div>
    </div>
  );

  return (
    <div>
      {acri}
      {ri}
    </div>
  );
});

SuggestionItem.propTypes = {
  item: PropTypes.object,
  ariaContent: PropTypes.arrayOf(PropTypes.string),
};

export default SuggestionItem;
