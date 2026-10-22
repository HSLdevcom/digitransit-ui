import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Toggle } from '@hsl-fi/form';

const SettingsToggle = forwardRef(function SettingsToggle(
  {
    label = '',
    labelId,
    labelStyle = '',
    toggled,
    onToggle,
    leftElement, // e.g. icon
    borderStyle = '',
  },
  ref,
) {
  return (
    <label className={`toggle-container ${borderStyle}`}>
      <div className="toggle-left">
        {leftElement}
        <span className={labelStyle}>
          {labelId && <FormattedMessage id={labelId} />}
          {label}
        </span>
      </div>
      <Toggle ref={ref} checked={toggled} onChange={onToggle} />
    </label>
  );
});

SettingsToggle.propTypes = {
  label: PropTypes.string,
  labelId: PropTypes.string,
  labelStyle: PropTypes.string,
  toggled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  leftElement: PropTypes.node,
  borderStyle: PropTypes.string,
};

export default SettingsToggle;
