import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FlexColumn, FlexRow, Text } from '@hsl-fi/layout-primitives';
import { useSortable } from '@dnd-kit/react/sortable';
import Icon from '@digitransit-component/digitransit-component-icon';
import { formatFavouritePlaceLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import styles from './styles.scss';
import i18n from './i18n';

const getIconId = selectedIconId => {
  const prefixPos = selectedIconId ? selectedIconId.indexOf('icon_') : -1;
  return prefixPos > 0 ? selectedIconId.substring(prefixPos + 5) : 'place';
};

/**
 * One row of the favourites list. The visually hidden arrow buttons are a
 * keyboard alternative to dragging.
 */
export default function FavouriteListItem({
  favourite,
  lang,
  onMoveUp = null,
  onMoveDown = null,
  onEdit,
  onDelete,
  index,
}) {
  const { t } = useTranslation('translation', { i18n });
  const { ref } = useSortable({ id: favourite.favouriteId, index });
  const iconId = getIconId(favourite.selectedIconId);
  const [name, address] = formatFavouritePlaceLabel(
    favourite.name,
    favourite.address,
  );

  return (
    <li ref={ref} className={styles.item}>
      <div className={styles.dragHandle}>
        {onMoveUp && (
          <button
            type="button"
            className={styles.arrow}
            aria-label={t('up', { lng: lang })}
            onClick={onMoveUp}
          >
            &uarr;
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            className={styles.arrow}
            aria-label={t('down', { lng: lang })}
            onClick={onMoveDown}
          >
            &darr;
          </button>
        )}
        <span className={styles.ellipsis}>
          <Icon img="ellipsis" color="currentColor" />
        </span>
        <span className={styles.placeIcon}>
          <Icon img={iconId} color="currentColor" />
        </span>
      </div>
      <FlexColumn className={styles.text}>
        <Text variant="text-xs-bold" as="p" className={styles.name}>
          {name}
        </Text>
        <Text variant="text-xs" as="p" color="weak" className={styles.address}>
          {address}
        </Text>
      </FlexColumn>
      <FlexRow alignItems="center" flexShrink={0}>
        <button
          type="button"
          className={styles.actionButton}
          aria-label={t('edit-place-name', { lng: lang, favourite })}
          onClick={onEdit}
        >
          <Icon img="edit" color="currentColor" />
        </button>
        <button
          type="button"
          className={styles.actionButton}
          aria-label={t('delete-place-name', { lng: lang, favourite })}
          onClick={onDelete}
        >
          <Icon img="trash" color="currentColor" />
        </button>
      </FlexRow>
    </li>
  );
}

FavouriteListItem.propTypes = {
  favourite: PropTypes.shape({
    favouriteId: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    selectedIconId: PropTypes.string,
  }).isRequired,
  lang: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  index: PropTypes.number.isRequired,
};
