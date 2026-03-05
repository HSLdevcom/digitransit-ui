import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { truncateLabel } from '../../../util/stringUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getAriaMessages, getClassNamePrefix } from './scheduleDropdownUtils';

/**
 * Generic dropdown used on the schedule page for stop selection.
 * Supports both controlled (via `value` prop) and uncontrolled (via `defaultValue`) usage.
 */
function ScheduleDropdown({
  alignRight,
  changeTitleOnChange,
  defaultValue,
  id,
  labelId,
  list,
  onSelectChange,
  title,
  value: controlledValue,
}) {
  const intl = useTranslationsContext();
  const config = useConfigContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? null,
  );

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const validatedValue =
    currentValue != null && list.some(opt => opt.value === currentValue)
      ? currentValue
      : null;

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const handleChange = selectedOption => {
    const newValue = selectedOption.value;

    if (!isControlled) {
      setUncontrolledValue(newValue);
    }

    if (onSelectChange) {
      onSelectChange(newValue);
    }
  };

  const optionList = useMemo(() => {
    return list.map(option => ({
      value: option.value,
      label: option.label,
      titleLabel: truncateLabel(option.label),
    }));
  }, [list]);

  const selectedOption = useMemo(() => {
    if (validatedValue == null) {
      return null;
    }
    return optionList.find(opt => opt.value === validatedValue) || null;
  }, [validatedValue, optionList]);

  const ariaMessages = useMemo(() => getAriaMessages(intl), [intl]);

  const classNamePrefix = getClassNamePrefix(alignRight, id);

  const displayLabel =
    changeTitleOnChange && selectedOption
      ? selectedOption.titleLabel || title
      : title;

  const renderDropdownContent = label => {
    return (
      <>
        <span>{truncateLabel(label)}</span>
        <Icon
          img="arrow-dropdown"
          height={0.625}
          width={0.625}
          color={config.colors.primary}
        />
      </>
    );
  };

  const formatOptionLabel = (option, { context }) => {
    if (context === 'value') {
      return renderDropdownContent(option.titleLabel || option.label);
    }

    if (!changeTitleOnChange || context !== 'menu') {
      return option.label;
    }

    const isSelected = validatedValue === option.value;
    return (
      <>
        <span>{option.label}</span>
        {isSelected && <Icon img="check" height={1.1525} width={0.904375} />}
      </>
    );
  };

  return (
    <div className={cx('dd-container', { withLabel: labelId })} aria-live="off">
      <label
        className={cx('dd-header-title', {
          alignRight: labelId && alignRight,
          'sr-only': !labelId,
        })}
        id={`aria-label-${id}`}
        htmlFor={`aria-input-${id}`}
      >
        {labelId ? intl.formatMessage({ id: labelId }) : title}
      </label>
      <Select
        aria-labelledby={`aria-label-${id}`}
        ariaLiveMessages={ariaMessages}
        className="dd-select"
        classNamePrefix={classNamePrefix}
        components={{
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        formatOptionLabel={formatOptionLabel}
        inputId={`aria-input-${id}`}
        isSearchable={false}
        name={id}
        menuIsOpen={isMenuOpen}
        onChange={handleChange}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        options={optionList}
        placeholder={displayLabel ? renderDropdownContent(displayLabel) : null}
        value={selectedOption}
      />
    </div>
  );
}

ScheduleDropdown.propTypes = {
  alignRight: PropTypes.bool,
  changeTitleOnChange: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string.isRequired,
  labelId: PropTypes.string,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  onSelectChange: PropTypes.func,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ScheduleDropdown.defaultProps = {
  alignRight: false,
  changeTitleOnChange: true,
  defaultValue: undefined,
  labelId: undefined,
  onSelectChange: undefined,
  title: 'No title',
  value: undefined,
};

ScheduleDropdown.displayName = 'ScheduleDropdown';

export default ScheduleDropdown;
