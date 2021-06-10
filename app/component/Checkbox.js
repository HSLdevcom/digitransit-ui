import cx from 'classnames';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Message from './Message';

import { isKeyboardSelectionEvent } from '../util/browser';
import Icon from './Icon';

const Checkbox = (
  {
    large,
    checked,
    checkedPartly,
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
    <div className={cx('option-checkbox-container', { large })} title={title}>
      <div
        aria-checked={checked}
        className={cx('option-checkbox', { large })}
        onKeyPress={e =>
          !disabled &&
          isKeyboardSelectionEvent(e) &&
          onChange({ target: { checked: !checked } })
        }
        role="checkbox"
        tabIndex={disabled ? -1 : 0}
      >
        <label className={cx({ checked, disabled })} htmlFor={id}>
          {checked && !checkedPartly && large && (
            <Icon
              className="checkmark large"
              img="icon-icon_check-digitransit"
              viewBox="0 0 15 11"
              width={1.875}
              height={1.75}
            />
          )}
          {checked && !checkedPartly && !large && (
            <Icon
              className="checkmark"
              img="icon-icon_check-digitransit"
              viewBox="0 0 15 11"
              width={1.375}
              height={1.25}
            />
          )}
          {checkedPartly && !large && (
            <Icon
              className="checkmark minus"
              img="icon-icon_minus"
              viewBox="0 0 15 11"
              width={1}
              height={1.25}
            />
          )}
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
  checkedPartly: PropTypes.bool,
  defaultMessage: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  labelId: PropTypes.string,
  showLabel: PropTypes.bool,
  title: PropTypes.string,
  name: PropTypes.string,
  large: PropTypes.bool,
};

Checkbox.defaultProps = {
  checked: false,
  checkedPartly: false,
  defaultMessage: '',
  disabled: false,
  labelId: undefined,
  showLabel: true,
  title: undefined,
  large: false,
};

Checkbox.contextTypes = {
  intl: intlShape.isRequired,
};

export default Checkbox;
