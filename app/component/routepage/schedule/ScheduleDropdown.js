import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import { truncateLabel } from '../../../util/stringUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getAriaMessages, getClassNamePrefix } from './scheduleDropdownUtils';

/**
 * Generic dropdown used on the schedule page for stop selection.
 */
function ScheduleDropdown({
  alignRight,
  id,
  list,
  onSelectChange,
  title,
  value,
}) {
  const intl = useTranslationsContext();
  const config = useConfigContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const validatedValue =
    value != null && list.some(opt => opt.value === value) ? value : null;

  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const handleChange = selectedOption => {
    if (onSelectChange) {
      onSelectChange(selectedOption.value);
    }
  };

  const selectedOption =
    validatedValue != null
      ? list.find(opt => opt.value === validatedValue) ?? null
      : null;

  const classNamePrefix = getClassNamePrefix(alignRight, id);

  const displayLabel = selectedOption ? selectedOption.label : title;

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
      return renderDropdownContent(option.label);
    }

    if (context !== 'menu') {
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
    <div className="dd-container withLabel" aria-live="off">
      <label
        className={cx('dd-header-title', { alignRight })}
        id={`aria-label-${id}`}
        htmlFor={`aria-input-${id}`}
      >
        {intl.formatMessage({ id })}
      </label>
      <Select
        aria-labelledby={`aria-label-${id}`}
        ariaLiveMessages={getAriaMessages(intl)}
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
        options={list}
        placeholder={renderDropdownContent(displayLabel)}
        value={selectedOption}
      />
    </div>
  );
}

ScheduleDropdown.propTypes = {
  alignRight: PropTypes.bool,
  id: PropTypes.string.isRequired,
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
  onSelectChange: undefined,
  title: 'No title',
  value: undefined,
};

ScheduleDropdown.displayName = 'ScheduleDropdown';

export default ScheduleDropdown;
