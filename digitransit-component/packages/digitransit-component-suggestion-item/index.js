/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

function getIcon(layer) {
  const layerIcon = new Map([
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
    ['route-BUS', 'bus'],
    ['route-TRAM', 'tram'],
    ['route-RAIL', 'rail'],
    ['route-SUBWAY', 'subway'],
    ['route-FERRY', 'ferry'],
    ['route-AIRPLANE', 'airplane'],
  ]);

  const defaultIcon = 'place';
  return layerIcon.get(layer) || defaultIcon;
}

/**
 * SuggestionItem renders suggestions for digitransit-autosuggest component.
 * @example
 * <SuggestionItem
 *    item={suggestionObject}
 *    ariaContent={'Station - Pasila - Helsinki'}
 *    loading={false}
 * />
 */
const SuggestionItem = pure(({ item, ariaContent, loading }) => {
  const icon = (
    <Icon
      // width={1.2}
      height={1.5}
      color="#888888"
      img={getIcon(item.properties.layer)}
    />
  );
  const [iconstr, name, label] = ariaContent;
  const acri = (
    <div className={styles['sr-only']}>
      <p>
        {' '}
        {iconstr} - {name} - {label}
      </p>
    </div>
  );
  const ri = (
    <div
      aria-hidden="true"
      className={cx(styles['search-result'], styles[item.type], {
        favourite: item.type.startsWith('Favourite'),
        loading,
      })}
    >
      <span aria-label={iconstr} className={styles['suggestion-icon']}>
        {icon}
      </span>
      <div>
        <p className={styles['suggestion-name']}>{name}</p>
        <p className={styles['suggestion-label']}>{label}</p>
      </div>
      <span className={styles.right}>
        <Icon width={0.625} height={1.063} img="Arrow" />
      </span>
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
