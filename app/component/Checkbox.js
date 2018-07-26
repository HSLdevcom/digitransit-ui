import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import { isKeyboardSelectionEvent } from '../util/browser';

const Checkbox = (
  { checked, disabled, onChange, labelId, defaultMessage, showLabel },
  { intl },
) => (
  <div className="option-checkbox-container">
    <div
      aria-checked={checked}
      className="option-checkbox"
      onKeyPress={e =>
        !disabled &&
        isKeyboardSelectionEvent(e) &&
        onChange({ target: { checked: !checked } })
      }
      role="checkbox"
      tabIndex={disabled ? -1 : 0}
    >
      <label className={cx({ checked, disabled })} htmlFor={`input-${labelId}`}>
        <input
          aria-label={intl.formatMessage({
            id: labelId,
            defaultMessage,
          })}
          checked={checked}
          disabled={disabled}
          id={`input-${labelId}`}
          onChange={onChange}
          type="checkbox"
        />
      </label>
    </div>
    {showLabel && (
      <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
    )}
  </div>
);

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultMessage: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  labelId: PropTypes.string.isRequired,
  showLabel: PropTypes.bool,
};

Checkbox.defaultProps = {
  checked: false,
  defaultMessage: '',
  disabled: false,
  showLabel: true,
};

Checkbox.contextTypes = {
  intl: intlShape.isRequired,
};

export default Checkbox;
