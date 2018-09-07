import cx from 'classnames';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import { isKeyboardSelectionEvent } from '../util/browser';

const Checkbox = (
  { checked, disabled, onChange, labelId, defaultMessage, showLabel },
  { intl },
) => {
  const id = uniqueId('input-');
  return (
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
        <label className={cx({ checked, disabled })} htmlFor={id}>
          <input
            aria-label={
              labelId
                ? intl.formatMessage({
                    id: labelId,
                    defaultMessage,
                  })
                : undefined
            }
            checked={checked}
            disabled={disabled}
            id={id}
            onChange={e => !disabled && onChange(e)}
            onClick={() =>
              !disabled && onChange({ target: { checked: !checked } })
            }
            type="checkbox"
          />
        </label>
      </div>
      {showLabel &&
        labelId && (
          <FormattedMessage id={labelId} defaultMessage={defaultMessage} />
        )}
    </div>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultMessage: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  labelId: PropTypes.string,
  showLabel: PropTypes.bool,
};

Checkbox.defaultProps = {
  checked: false,
  defaultMessage: '',
  disabled: false,
  labelId: undefined,
  showLabel: true,
};

Checkbox.contextTypes = {
  intl: intlShape.isRequired,
};

export default Checkbox;
