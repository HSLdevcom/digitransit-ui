import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Input clear button element
 * @typedef {object} ClearButtonProps
 * @property {string} color // hex color string
 * @property {string} lng // language, eg. 'fi'
 * @property {() => void} clearInput
 * @property {() => void} [onKeyDown]
 * @param {ClearButtonProps} props
 * @returns {JSX.Element}
 */
export const ClearButton = ({ color, lng, clearInput, onKeyDown, styles }) => {
  const [t] = useTranslation();
  return (
    <button
      type="button"
      className={styles['clear-input']}
      onClick={clearInput}
      aria-label={t('clear-button-label', { lng })}
      onKeyDown={onKeyDown}
    >
      <Icon img="close" color={color} />
    </button>
  );
};

ClearButton.propTypes = {
  color: PropTypes.string.isRequired,
  lng: PropTypes.string.isRequired,
  clearInput: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
};
