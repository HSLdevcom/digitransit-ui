import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import merge from 'lodash/merge';
import Checkbox from './Checkbox';
import Icon from './Icon';

const LayerCategoryDropdown = ({ title, options, onChange }, { intl }) => {
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
        setChecked(true);
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

  return (
    <div className="layer-category-dropdown-container">
      <div className="layer-category-dropdown-header">
        <Checkbox
          checked={checked}
          checkedPartly={checkedPartly}
          defaultMessage={title}
          labelId=""
          onChange={e => handleCheckAll(e.target.checked)}
        />
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
            img="icon-icon_arrow-dropdown"
          />
        </button>
      </div>
      {open && (
        <ul role="radiogroup">
          {options
            .filter(option => option)
            .map(option => (
              <div
                key={option.key || option.labelId}
                className="layer-category-dropdown-option"
              >
                <Checkbox
                  checked={option.checked}
                  defaultMessage={option.defaultMessage}
                  labelId={option.labelId}
                  onChange={e => {
                    onChange(updateSettings(option.settings, e.target.checked));
                  }}
                />
              </div>
            ))}
        </ul>
      )}
    </div>
  );
};

LayerCategoryDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

LayerCategoryDropdown.contextTypes = {
  intl: intlShape.isRequired,
};

export default LayerCategoryDropdown;
