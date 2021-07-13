import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import merge from 'lodash/merge';
import Checkbox from './Checkbox';
import Icon from './Icon';
import Message from './Message';
import withBreakpoint from '../util/withBreakpoint';

const LayerCategoryDropdown = (
  { title, icon, options, onChange, breakpoint },
  { intl },
) => {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState();
  const [checkedPartly, setCheckedPartly] = useState();

  useEffect(() => {
    const allChecked = options
      .filter(option => option)
      .map(option => option.checked);
    if (allChecked) {
      if (!allChecked.includes(false)) {
        setChecked(true);
        setCheckedPartly(false);
      } else if (allChecked.includes(true)) {
        setChecked(false);
        setCheckedPartly(true);
      } else {
        setChecked(false);
        setCheckedPartly(false);
      }
    }
  }, [options]);

  const toggleDropdown = () => {
    setOpen(prevState => !prevState);
  };

  const updateSettings = (settings, settingChecked) => {
    if (typeof settings === 'object') {
      return Object.keys(settings)
        .map(key => {
          return {
            [key]: { [settings[key]]: settingChecked },
          };
        })
        .reduce((newSettings, newSetting) => {
          return { ...newSettings, ...newSetting };
        }, {});
    }
    return { [settings]: settingChecked };
  };

  const handleCheckAll = settingsChecked => {
    onChange(
      options
        .filter(option => option)
        .map(option => updateSettings(option.settings, settingsChecked))
        .reduce((settings, setting) => {
          merge(settings, setting);
          return settings;
        }, {}),
    );
  };

  const isMobile = breakpoint !== 'large';

  return (
    <div className="layer-category-dropdown-container">
      <div className="layer-category-dropdown-header">
        <div className="layer-category-dropdown-header-content">
          <Checkbox
            checked={checked || checkedPartly}
            className={cx(
              'layer-category-dropdown-checkbox',
              isMobile && 'mobile',
            )}
            icon={
              !checkedPartly ? 'icon-icon_check-white' : 'icon-icon_minus-white'
            }
            showLabel={false}
            onChange={e => {
              if (checkedPartly) {
                handleCheckAll(true);
              } else {
                handleCheckAll(e.target.checked);
              }
            }}
          />
          <Icon
            className="layer-category-dropdown-header-icon"
            img={icon}
            viewBox="0 0 15 11"
            width={1.875}
            height={1.25}
          />
          {title}
        </div>
        <button
          className="layer-category-dropdown-button"
          type="button"
          onClick={() => toggleDropdown()}
        >
          <span className="sr-only">
            {intl.formatMessage({
              id: open
                ? 'layer-dropdown-close-label'
                : 'layer-dropdown-open-label',
            })}
          </span>
          <Icon
            className={cx(open && 'inverted')}
            color="#707070"
            img="icon-icon_arrow-dropdown"
          />
        </button>
      </div>
      {open && (
        <div className="layer-category-dropdown-content">
          {options
            .filter(option => option)
            .map(option => (
              <div
                key={option.key || option.labelId}
                className="layer-category-dropdown-option"
              >
                <Checkbox
                  checked={option.checked}
                  className="layer-category-dropdown-checkbox"
                  icon="icon-icon_check-white"
                  showLabel={false}
                  onChange={e => {
                    onChange(updateSettings(option.settings, e.target.checked));
                  }}
                />
                <Icon
                  className="layer-category-dropdown-header-icon"
                  img={option.icon}
                  viewBox="0 0 15 11"
                  width={1.875}
                  height={1.25}
                />
                <Message
                  labelId={option.labelId}
                  defaultMessage={option.defaultMessage}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

LayerCategoryDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

LayerCategoryDropdown.contextTypes = {
  intl: intlShape.isRequired,
};

export default withBreakpoint(LayerCategoryDropdown);
