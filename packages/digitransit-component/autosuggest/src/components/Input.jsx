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
  clearInput,
  ariaLabel,
  ariaDescription,
  hasLabel = false,
  inputRef,
  styles,
  isMobile,
  inputClassName,
  transportMode,
  clearButtonColor,
  autoFocus = false,
  inputOnBlur = () => {},
  onValueChange,
}) {
  const handleChange = e => {
    // Downshift reports the new value only in an effect, one render later. Until
    // then it feeds the stale controlled inputValue back into the DOM node, which
    // wipes the keystroke and desyncs Android keyboards' composing range.
    onValueChange(e.target.value);
  };

  const descriptionId = `${id}-description`;

  return (
    <div className={styles.container}>
      <input
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
        id={id}
        aria-describedby={ariaDescription ? descriptionId : undefined}
        {...getInputProps({
          ref: inputRef,
          onBlur: inputOnBlur,
          onChange: handleChange,
          // Downshift points aria-labelledby at its own label unless aria-label is given.
          // Drop the reference when no such label is rendered.
          ...(ariaLabel && { 'aria-label': ariaLabel }),
          ...(!ariaLabel && !hasLabel && { 'aria-labelledby': undefined }),
        })}
      />
      {ariaDescription && (
        <span id={descriptionId} className={styles['sr-only']}>
          {ariaDescription}
        </span>
      )}
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
  clearInput: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
  ariaDescription: PropTypes.string,
  hasLabel: PropTypes.bool,
  inputRef: PropTypes.shape({ current: PropTypes.oneOfType([PropTypes.string, PropTypes.object]) })
    .isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
  isMobile: PropTypes.bool.isRequired,
  inputClassName: PropTypes.string.isRequired,
  transportMode: PropTypes.string,
  clearButtonColor: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  inputOnBlur: PropTypes.func,
  onValueChange: PropTypes.func.isRequired,
};
