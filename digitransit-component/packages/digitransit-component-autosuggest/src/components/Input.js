import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ClearButton } from './ClearButton';
import { isKeyboardSelectionEvent } from '../utils/utils';

export function Input({
  id,
  lng,
  value,
  placeholder,
  required,
  getInputProps,
  getLabelProps,
  clearInput,
  ariaLabel,
  inputRef,
  styles,
  renderLabel,
  isMobile,
  inputClassName,
  transportMode,
  clearButtonColor,
  autoFocus,
  inputOnBlur,
}) {
  return (
    <div className={styles.container}>
      {renderLabel && (
        <label
          {...getLabelProps({
            className: styles['sr-only'],
            htmlFor: id,
          })}
        >
          {ariaLabel}
        </label>
      )}
      <input
        aria-label={ariaLabel}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        placeholder={placeholder}
        required={required}
        type="text"
        className={cx(
          styles.input,
          isMobile && transportMode ? styles.thin : '',
          styles[id] || '',
          value ? styles.hasValue : '',
          inputClassName,
        )}
        value={value}
        id={id}
        {...getInputProps({
          ref: inputRef,
          onBlur: inputOnBlur,
        })}
      />
      {value && (
        <ClearButton
          lng={lng}
          clearInput={() => clearInput(inputRef)}
          styles={styles}
          color={clearButtonColor}
          onKeyDown={e => isKeyboardSelectionEvent(e) && clearInput(inputRef)}
        />
      )}
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string.isRequired,
  lng: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  getInputProps: PropTypes.func.isRequired,
  getLabelProps: PropTypes.func.isRequired,
  clearInput: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  inputRef: PropTypes.shape({
    current: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  renderLabel: PropTypes.bool,
  isMobile: PropTypes.bool.isRequired,
  inputClassName: PropTypes.string.isRequired,
  transportMode: PropTypes.string,
  clearButtonColor: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  inputOnBlur: PropTypes.func,
};

Input.defaultProps = {
  autoFocus: false,
  renderLabel: false,
  transportMode: undefined,
  inputOnBlur: () => {},
};
