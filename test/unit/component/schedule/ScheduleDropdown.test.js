import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { shallow } from 'enzyme';
import Select from 'react-select';
import Icon from '@digitransit-component/digitransit-component-icon';

import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import {
  getAriaMessages,
  getClassNamePrefix,
} from '../../../../app/component/routepage/schedule/scheduleDropdownUtils';
import { createSimpleTestContext } from '../../helpers/mock-schedule-context';

describe('<ScheduleDropdown />', () => {
  let sandbox;
  let defaultProps;

  beforeEach(() => {
    const testContext = createSimpleTestContext();
    sandbox = testContext.sandbox;

    defaultProps = {
      id: 'test-dropdown',
      title: 'Kamppi',
      list: [
        { label: 'Kamppi', value: 'kamppi' },
        { label: 'Rautatientori', value: 'rautatientori' },
        { label: 'Sörnäinen', value: 'sornainen' },
      ],
      onSelectChange: sandbox.spy(),
      alignRight: false,
      changeTitleOnChange: true,
      labelId: undefined,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Display behavior', () => {
    it('should display the initial title in placeholder', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      expect(select.prop('placeholder')).to.not.equal(undefined);
    });

    it('should keep original title displayed when changeTitleOnChange is false', () => {
      const props = { ...defaultProps, changeTitleOnChange: false };
      const wrapper = shallow(<ScheduleDropdown {...props} />);

      // Get initial displayed text
      let placeholder = wrapper.find(Select).prop('placeholder');
      const initialText = placeholder.props.children[0].props.children;

      // Simulate selection
      const select = wrapper.find(Select);
      select.prop('onChange')({
        value: 'sornainen',
        label: 'Sörnäinen',
        titleLabel: 'Sörnäinen',
      });

      wrapper.update();

      // Displayed text should remain unchanged
      placeholder = wrapper.find(Select).prop('placeholder');
      expect(placeholder.props.children[0].props.children).to.equal(
        initialText,
      );
    });

    it('should handle selection when onSelectChange is not provided', () => {
      const props = { ...defaultProps, onSelectChange: undefined };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const option = { value: 'kamppi', label: 'Kamppi', titleLabel: 'Kamppi' };
      expect(() => select.prop('onChange')(option)).to.not.throw();
    });
  });

  describe('State management', () => {
    it('should select option matching controlled value prop', () => {
      const props = { ...defaultProps, value: 'kamppi' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const valueProp = select.prop('value');
      expect(valueProp).to.be.an('object');
      expect(valueProp.value).to.equal('kamppi');
    });

    it('should clear selection when value is not in options list', () => {
      const props = { ...defaultProps, value: 'nonexistent' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const valueProp = select.prop('value');
      expect(valueProp).to.equal(null);
    });

    it('should update selection when controlled value prop changes', () => {
      const props = { ...defaultProps, value: 'kamppi' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);

      let select = wrapper.find(Select);
      expect(select.prop('value').value).to.equal('kamppi');

      // Update controlled value
      wrapper.setProps({ value: 'sornainen' });
      wrapper.update();

      select = wrapper.find(Select);
      expect(select.prop('value').value).to.equal('sornainen');
    });
  });

  describe('Menu behavior', () => {
    it('should render checkmark icon next to selected option when changeTitleOnChange is true', () => {
      const props = {
        ...defaultProps,
        changeTitleOnChange: true,
        value: 'kamppi',
      };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const formatOptionLabel = select.prop('formatOptionLabel');
      const selectedOption = { value: 'kamppi', label: 'Kamppi' };
      const unselectedOption = { value: 'sornainen', label: 'Sörnäinen' };

      // Format selected option (in menu context) - returns JSX fragment
      const selectedFormatted = formatOptionLabel(selectedOption, {
        context: 'menu',
      });
      const selectedWrapper = shallow(<div>{selectedFormatted}</div>);
      // Should contain Icon with check
      expect(selectedWrapper.find(Icon).prop('img')).to.equal('check');
      expect(selectedWrapper.text()).to.include('Kamppi');

      // Format unselected option (in menu context) - returns JSX fragment
      const unselectedFormatted = formatOptionLabel(unselectedOption, {
        context: 'menu',
      });
      const unselectedWrapper = shallow(<div>{unselectedFormatted}</div>);
      // Should not contain Icon
      expect(unselectedWrapper.find(Icon)).to.have.lengthOf(0);
      expect(unselectedWrapper.text()).to.include('Sörnäinen');
    });

    it('should not render checkmark icons when changeTitleOnChange is false', () => {
      const props = {
        ...defaultProps,
        changeTitleOnChange: false,
        value: 'kamppi',
      };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const formatOptionLabel = select.prop('formatOptionLabel');
      const selectedOption = { value: 'kamppi', label: 'Kamppi' };

      // Format selected option (in menu context)
      const formatted = formatOptionLabel(selectedOption, { context: 'menu' });

      // Should just return the label without icon (plain string or label value)
      expect(formatted).to.equal('Kamppi');
    });

    it('should format options correctly in value context (no checkmark)', () => {
      const props = {
        ...defaultProps,
        changeTitleOnChange: true,
        value: 'kamppi',
      };
      const wrapper = shallow(<ScheduleDropdown {...props} />);
      const select = wrapper.find(Select);

      const formatOptionLabel = select.prop('formatOptionLabel');
      const selectedOption = { value: 'kamppi', label: 'Kamppi' };

      // Format in value context (displayed in dropdown button)
      const valueFormatted = formatOptionLabel(selectedOption, {
        context: 'value',
      });

      // Should not show a checkmark icon in value context (only in menu context)
      const rendered = shallow(<div>{valueFormatted}</div>);
      expect(rendered.find(Icon).filter({ img: 'check' })).to.have.lengthOf(0);
    });

    it('should pass all options to Select component', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);
      const options = select.prop('options');

      expect(options).to.have.lengthOf(3);
      expect(options[0].value).to.equal('kamppi');
      expect(options[1].value).to.equal('rautatientori');
      expect(options[2].value).to.equal('sornainen');
    });
  });

  describe('Accessibility', () => {
    it('should properly associate label and input IDs for screen readers', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);
      const label = wrapper.find('label').first();
      const select = wrapper.find(Select);

      const labelId = 'aria-label-test-dropdown';
      const inputId = 'aria-input-test-dropdown';

      expect(label.prop('id')).to.equal(labelId);
      expect(label.prop('htmlFor')).to.equal(inputId);
      expect(select.prop('inputId')).to.equal(inputId);
      expect(select.prop('aria-labelledby')).to.equal(labelId);
    });

    it('should render visible label when labelId is provided', () => {
      const props = { ...defaultProps, labelId: 'origin' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);

      const visibleLabel = wrapper
        .find('label.dd-header-title')
        .not('.sr-only');
      expect(visibleLabel).to.have.lengthOf(1);
    });

    it('should render screen-reader-only label when labelId is not provided', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);

      const srOnlyLabel = wrapper.find('label.sr-only');
      expect(srOnlyLabel).to.have.lengthOf(1);
      expect(srOnlyLabel.text()).to.equal(defaultProps.title);
    });

    it('should render localized label text when labelId is provided', () => {
      const props = { ...defaultProps, labelId: 'origin' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);

      const label = wrapper.find('label').first();
      const select = wrapper.find(Select);

      // Label should contain translated text from intl context (mock returns 'translated text')
      expect(label.text()).to.equal('translated text');
      // When labelId is provided, visible label should not have sr-only class
      expect(label.hasClass('sr-only')).to.equal(false);
      // Select should reference this label via aria-labelledby
      expect(select.prop('aria-labelledby')).to.equal(
        'aria-label-test-dropdown',
      );
    });

    it('should render title as fallback when labelId is not provided', () => {
      const props = { ...defaultProps, title: 'Custom Stop Name' };
      const wrapper = shallow(<ScheduleDropdown {...props} />);

      const label = wrapper.find('label').first();
      const select = wrapper.find(Select);

      // Label should contain the title prop as fallback
      expect(label.text()).to.equal('Custom Stop Name');
      // Select should reference this label
      expect(select.prop('aria-labelledby')).to.equal(
        'aria-label-test-dropdown',
      );
    });

    it('should not have aria-label prop that would override aria-labelledby', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      // aria-label should not be present, allowing aria-labelledby to work
      expect(select.prop('aria-label')).to.equal(undefined);
    });
  });

  describe('User interaction callbacks', () => {
    it('should call onSelectChange with the selected value string', () => {
      const wrapper = shallow(<ScheduleDropdown {...defaultProps} />);
      const select = wrapper.find(Select);

      select.prop('onChange')({
        value: 'rautatientori',
        label: 'Rautatientori',
        titleLabel: 'Rautatientori',
      });

      expect(defaultProps.onSelectChange.calledOnce).to.equal(true);
      expect(defaultProps.onSelectChange.firstCall.args[0]).to.equal(
        'rautatientori',
      );
    });
  });
});

describe('scheduleDropdownUtils', () => {
  describe('getClassNamePrefix', () => {
    it('should return dd-timerange for other-dates with alignRight', () => {
      expect(getClassNamePrefix(true, 'other-dates')).to.equal('dd-timerange');
    });

    it('should return dd-right for alignRight with other IDs', () => {
      expect(getClassNamePrefix(true, 'some-dropdown')).to.equal('dd-right');
    });

    it('should return dd when alignRight is false', () => {
      expect(getClassNamePrefix(false, 'any-id')).to.equal('dd');
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

      expect(messages).to.have.property('guidance');
      expect(messages).to.have.property('onChange');
      expect(messages).to.have.property('onFilter');
      expect(messages).to.have.property('onFocus');
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

      expect(changeMessage).to.include('Selected:');
      expect(changeMessage).to.include('Test Stop');
    });
  });
});
