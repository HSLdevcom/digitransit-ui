import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './styles.scss';
import i18n from './i18n';

export const FAVOURITE_ICON_NAMES = [
  'place',
  'home',
  'work',
  'sport',
  'school',
  'shopping',
];

export const toFavouriteIconId = name => `icon-icon_${name}`;

/** Icon picker: one toggle button per favourite icon. */
function FavouriteIconTable({ selectedIconId = '', onSelect, lang }) {
  const { t } = useTranslation('translation', { i18n });

  return (
    <div className={styles.iconTable}>
      {FAVOURITE_ICON_NAMES.map(name => {
        const selected = selectedIconId === toFavouriteIconId(name);
        return (
          <button
            key={name}
            type="button"
            className={cx(styles.iconButton, styles[name], {
              [styles.selected]: selected,
            })}
            aria-pressed={selected}
            aria-label={t(name, { lng: lang })}
            onClick={() => onSelect(name)}
          >
            <Icon img={name} color="currentColor" />
          </button>
        );
      })}
    </div>
  );
}

FavouriteIconTable.propTypes = {
  onSelect: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  selectedIconId: PropTypes.string,
};

export default FavouriteIconTable;
