/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from './helpers/Icon';

function getIcon(layer) {
  const layerIcon = new Map([
    ['currentPosition', `Locate`],
    ['favouritePlace', 'Star'],
    ['favouriteRoute', 'Star'],
    ['favouriteStop', 'Star'],
    ['favouriteStation', 'Star'],
    ['favourite', 'Star'],
    ['address', 'Place'],
    ['stop', 'Busstop'],
    ['locality', 'City'],
    ['station', 'Station'],
    ['localadmin', 'City'],
    ['neighbourhood', 'City'],
    ['route-BUS', 'Bus'],
    ['route-TRAM', 'Tram'],
    ['route-RAIL', 'Rail'],
    ['route-SUBWAY', 'Subway'],
    ['route-FERRY', 'Ferry'],
    ['route-AIRPLANE', 'Airplane'],
  ]);

  const defaultIcon = 'Place';
  return layerIcon.get(layer) || defaultIcon;
}

/**
 * SuggestionItem renders suggestions for digitransit-autosuggest component.
 * @example
 * <SuggestionItem
 *    item={suggestionObject}
 * />
 */
const SuggestionItem = pure(({ item, ariaContent, loading }) => {
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
        loading,
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
