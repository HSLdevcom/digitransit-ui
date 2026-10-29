import PropTypes from 'prop-types';
import { useMemo } from 'react';
import uniqueId from 'lodash/uniqueId';
import { useIntl } from 'react-intl';
import { Checkbox as DsCheckbox } from '@hsl-fi/form';

const Checkbox = ({
  large,
  checked = false,
  disabled,
  onChange,
  labelId,
  defaultMessage,
}) => {
  const intl = useIntl();
  const id = useMemo(() => uniqueId('checkbox-'), []);
  const label = labelId
    ? intl.formatMessage({ id: labelId, defaultMessage })
    : defaultMessage;

  return (
    <DsCheckbox
      id={id}
      name={id}
      size={large ? 'l' : 'm'}
      checked={checked}
      disabled={disabled}
      onChange={e => !disabled && onChange(e)}
      title={label}
    />
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  defaultMessage: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  labelId: PropTypes.string,
  large: PropTypes.bool,
};

export default Checkbox;
