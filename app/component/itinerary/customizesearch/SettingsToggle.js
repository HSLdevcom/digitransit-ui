import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';

export default function SettingsToggle({
  id,
  label,
  labelId,
  labelStyle,
  toggled,
  onToggle,
  leftElement, // e.g. icon
  borderStyle,
}) {
  return (
    <label htmlFor={id} className={`toggle-container ${borderStyle}`}>
      <div className="toggle-left">
        {leftElement}
        <span className={labelStyle}>
          {labelId && <FormattedMessage id={labelId} />}
          {label}
        </span>
      </div>
      <Toggle id={id} toggled={toggled} onToggle={onToggle} />
    </label>
  );
}

SettingsToggle.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelId: PropTypes.string,
  labelStyle: PropTypes.string,
  toggled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  leftElement: PropTypes.node,
  borderStyle: PropTypes.string,
};

SettingsToggle.defaultProps = {
  leftElement: undefined,
  label: '',
  labelId: undefined,
  labelStyle: '',
  borderStyle: '',
};
