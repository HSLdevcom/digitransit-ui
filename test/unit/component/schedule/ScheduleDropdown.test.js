import React from 'react';
import { shallow } from 'enzyme';
import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';

import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import {
  getAriaMessages,
  getClassNamePrefix,
} from '../../../../app/component/routepage/schedule/scheduleDropdownUtils';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import translations from '../../../../app/translations/en';

const testMessages = { ...translations, 'test-dropdown': 'Test dropdown' };
const renderDropdown = node =>
  shallowWithIntl(node, { messages: testMessages });

describe('<ScheduleDropdown />', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      id: 'test-dropdown',
      title: 'Kamppi',
      list: [
        { label: 'Kamppi', value: 'kamppi' },
        { label: 'Rautatientori', value: 'rautatientori' },
        { label: 'Sörnäinen', value: 'sornainen' },
      ],
      onSelectChange: vi.fn(),
      alignRight: false,
    };
  });

  describe('Display behavior', () => {
    it('should display the initial title in placeholder', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      expect(select.prop('placeholder')).not.toBe(undefined);
    });

    it('should handle selection when onSelectChange is not provided', () => {
      const props = { ...defaultProps, onSelectChange: undefined };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const option = { value: 'kamppi', label: 'Kamppi' };
      expect(() => select.prop('onChange')(option)).not.toThrow();
    });
  });

  describe('State management', () => {
    it('should select option matching controlled value prop', () => {
      const props = { ...defaultProps, value: 'kamppi' };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const valueProp = select.prop('value');
      expect(typeof valueProp).toBe('object');
      expect(valueProp.value).toBe('kamppi');
    });

    it('should clear selection when value is not in options list', () => {
      const props = { ...defaultProps, value: 'nonexistent' };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const valueProp = select.prop('value');
      expect(valueProp).toBe(null);
    });

    it('should update selection when controlled value prop changes', () => {
      const props = { ...defaultProps, value: 'kamppi' };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);

      let select = wrapper.find(Select);
      expect(select.prop('value').value).toBe('kamppi');

      // Update controlled value
      wrapper.setProps({ value: 'sornainen' });
      wrapper.update();

      select = wrapper.find(Select);
      expect(select.prop('value').value).toBe('sornainen');
    });
  });

  describe('Menu behavior', () => {
    it('should render checkmark icon next to selected option in menu context', () => {
      const props = {
        ...defaultProps,
        value: 'kamppi',
      };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const formatOptionLabel = select.prop('formatOptionLabel');
      const selectedOption = { value: 'kamppi', label: 'Kamppi' };
      const unselectedOption = { value: 'sornainen', label: 'Sörnäinen' };

      // Format selected option (in menu context) - returns JSX fragment
      const selectedFormatted = formatOptionLabel(selectedOption, {
        context: 'menu',
      });
      const selectedWrapper = shallow(<div>{selectedFormatted}</div>);
      expect(selectedWrapper.find(Icon).prop('img')).toBe('check');
      expect(selectedWrapper.text()).toContain('Kamppi');

      // Format unselected option (in menu context) - returns JSX fragment
      const unselectedFormatted = formatOptionLabel(unselectedOption, {
        context: 'menu',
      });
      const unselectedWrapper = shallow(<div>{unselectedFormatted}</div>);
      expect(unselectedWrapper.find(Icon)).toHaveLength(0);
      expect(unselectedWrapper.text()).toContain('Sörnäinen');
    });

    it('should format options correctly in value context (no checkmark)', () => {
      const props = {
        ...defaultProps,
        value: 'kamppi',
      };
      const wrapper = renderDropdown(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const formatOptionLabel = select.prop('formatOptionLabel');
      const selectedOption = { value: 'kamppi', label: 'Kamppi' };

      // Format in value context (displayed in dropdown button)
      const valueFormatted = formatOptionLabel(selectedOption, {
        context: 'value',
      });

      // Should not show a checkmark icon in value context (only in menu context)
      const rendered = shallow(<div>{valueFormatted}</div>);
      expect(rendered.find(Icon).filter({ img: 'check' })).toHaveLength(0);
    });

    it('should pass all options to Select component', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);
      const options = select.prop('options');

      expect(options).toHaveLength(3);
      expect(options[0].value).toBe('kamppi');
      expect(options[1].value).toBe('rautatientori');
      expect(options[2].value).toBe('sornainen');
    });
  });

  describe('Accessibility', () => {
    it('should properly associate label and input IDs for screen readers', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);
      const label = wrapper.find('label').first();
      const select = wrapper.find(Select);

      const labelId = 'aria-label-test-dropdown';
      const inputId = 'aria-input-test-dropdown';

      expect(label.prop('id')).toBe(labelId);
      expect(label.prop('htmlFor')).toBe(inputId);
      expect(select.prop('inputId')).toBe(inputId);
      expect(select.prop('aria-labelledby')).toBe(labelId);
    });

    it('should render visible label', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);

      const visibleLabel = wrapper
        .find('label.dd-header-title')
        .not('.sr-only');
      expect(visibleLabel).toHaveLength(1);
    });

    it('should render localized label text using id as translation key', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);

      const label = wrapper.find('label').first();
      const select = wrapper.find(Select);

      expect(label.text()).toBe('Test dropdown');
      expect(label.hasClass('sr-only')).toBe(false);
      expect(select.prop('aria-labelledby')).toBe('aria-label-test-dropdown');
    });

    it('should not have aria-label prop that would override aria-labelledby', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      expect(select.prop('aria-label')).toBe(undefined);
    });
  });

  describe('User interaction callbacks', () => {
    it('should call onSelectChange with the selected value string', () => {
      const wrapper = renderDropdown(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      select.prop('onChange')({
        value: 'rautatientori',
        label: 'Rautatientori',
      });

      expect(defaultProps.onSelectChange).toHaveBeenCalledOnce();
      expect(defaultProps.onSelectChange.mock.calls[0][0]).toBe(
        'rautatientori',
      );
    });
  });
});

describe('scheduleDropdownUtils', () => {
  describe('getClassNamePrefix', () => {
    it('should return dd-timerange for other-dates with alignRight', () => {
      expect(getClassNamePrefix(true, 'other-dates')).toBe('dd-timerange');
    });

    it('should return dd-right for alignRight with other IDs', () => {
      expect(getClassNamePrefix(true, 'some-dropdown')).toBe('dd-right');
    });

    it('should return dd when alignRight is false', () => {
      expect(getClassNamePrefix(false, 'any-id')).toBe('dd');
    });
  });

  describe('getAriaMessages', () => {
    it('should return aria message configuration object', () => {
      const mockIntl = {
        formatMessage: ({ id }) => {
          if (id === 'route-page.pattern-chosen') {
            return 'Chosen';
          }
          return id;
        },
      };

      const messages = getAriaMessages(mockIntl);

      expect(messages).toHaveProperty('guidance');
      expect(messages).toHaveProperty('onChange');
      expect(messages).toHaveProperty('onFilter');
      expect(messages).toHaveProperty('onFocus');
    });

    it('should format onChange message with option label', () => {
      const mockIntl = {
        formatMessage: ({ id }) => {
          if (id === 'route-page.pattern-chosen') {
            return 'Selected:';
          }
          return id;
        },
      };

      const messages = getAriaMessages(mockIntl);
      const changeMessage = messages.onChange({
        value: { label: 'Test Stop' },
      });

      expect(changeMessage).toContain('Selected:');
      expect(changeMessage).toContain('Test Stop');
    });
  });
});
