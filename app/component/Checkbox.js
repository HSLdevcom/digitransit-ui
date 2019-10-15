import cx from 'classnames';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Message from './Message';

import { isKeyboardSelectionEvent } from '../util/browser';

const Checkbox = (
  {
    checked,
    disabled,
    onChange,
    labelId,
    defaultMessage,
    showLabel,
    title,
    name,
  },
  { intl },
) => {
  const id = uniqueId('input-');
  return (
    <div className="option-checkbox-container" title={title}>
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
                : defaultMessage
            }
            checked={checked}
            disabled={disabled}
            id={id}
            onChange={e => !disabled && onChange(e)}
            type="checkbox"
            name={name}
          />
        </label>
      </div>
      {showLabel && (
        <Message labelId={labelId} defaultMessage={defaultMessage} />
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
  title: PropTypes.string,
  name: PropTypes.string,
};

Checkbox.defaultProps = {
  checked: false,
  defaultMessage: '',
  disabled: false,
  labelId: undefined,
  showLabel: true,
  title: undefined,
};

Checkbox.contextTypes = {
  intl: intlShape.isRequired,
};

export default Checkbox;
