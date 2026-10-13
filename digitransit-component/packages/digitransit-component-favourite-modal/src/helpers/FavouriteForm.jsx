import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@hsl-fi/form';
import { Button } from '@hsl-fi/layout-primitives';
import styles from './styles.scss';
import i18n from './i18n';
import FavouriteIconTable, { toFavouriteIconId } from './FavouriteIconTable';

const NO_EDITS = {};

/**
 * Form body of the modal. It lives inside the dialog content, so the user's
 * edits are discarded when the dialog closes.
 */
function FavouriteForm({
  favourite,
  isEdit,
  lang,
  autosuggestComponent,
  saveFavourite,
  cancelSelected,
  handleClose,
}) {
  const { t } = useTranslation('translation', { i18n });
  const [edits, setEdits] = useState(NO_EDITS);
  const current = { ...favourite, ...edits };

  const canSave =
    !!current.selectedIconId &&
    Number.isFinite(current.lat) &&
    Number.isFinite(current.lon);

  const specifyName = event => {
    const { value } = event.target;
    setEdits(previous => ({ ...previous, name: value }));
  };

  const selectIcon = iconName => {
    setEdits(previous => ({
      ...previous,
      selectedIconId: toFavouriteIconId(iconName),
    }));
  };

  const save = () => {
    if (!canSave) {
      return;
    }
    const { defaultName, ...rest } = current;
    saveFavourite({
      ...rest,
      name: current.name || defaultName,
      type: 'place',
    });
    if (isEdit) {
      cancelSelected();
    } else {
      handleClose();
    }
  };

  const namePlaceholder = t('input-placeholder', { lng: lang });

  return (
    <div className={styles.content}>
      <div className={styles.search}>{autosuggestComponent}</div>
      <TextInput
        label={namePlaceholder}
        hideLabel
        placeholder={namePlaceholder}
        value={current.name || ''}
        onChange={specifyName}
      />
      <fieldset className={styles.iconFieldset}>
        <legend className={styles.legend}>
          {t('choose-icon', { lng: lang })}
          <span className={styles.srOnly}>
            {t('required-text', { lng: lang })}
          </span>
        </legend>
        <FavouriteIconTable
          selectedIconId={current.selectedIconId}
          onSelect={selectIcon}
          lang={lang}
        />
      </fieldset>
      <div className={styles.buttons}>
        <Button
          variant="primary"
          size="l"
          expand
          disabled={!canSave}
          aria-label={
            canSave
              ? t('save-place', { lng: lang })
              : t('cannot-save-place', { lng: lang })
          }
          onClick={save}
        >
          {t('save', { lng: lang })}
        </Button>
        {isEdit && (
          <Button variant="secondary" size="l" expand onClick={cancelSelected}>
            {t('cancel', { lng: lang })}
          </Button>
        )}
      </div>
    </div>
  );
}

FavouriteForm.propTypes = {
  isEdit: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  saveFavourite: PropTypes.func.isRequired,
  cancelSelected: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  autosuggestComponent: PropTypes.node.isRequired,
  favourite: PropTypes.shape({
    name: PropTypes.string,
    defaultName: PropTypes.string,
    selectedIconId: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
};

export default FavouriteForm;
