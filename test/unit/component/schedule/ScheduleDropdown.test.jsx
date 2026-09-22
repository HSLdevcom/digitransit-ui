import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import ScheduleDropdown, {
  handleScheduleDropdownChange,
} from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import {
  getAriaMessages,
  getClassNamePrefix,
} from '../../../../app/component/routepage/schedule/scheduleDropdownUtils';

describe('<ScheduleDropdown />', () => {
  const list = [
    { label: 'Kamppi', value: 'kamppi' },
    { label: 'Rautatientori', value: 'rautatientori' },
  ];
  const messages = { 'test-dropdown': 'Test dropdown' };
  const renderDropdown = props =>
    renderWithProviders(
      <ScheduleDropdown
        id="test-dropdown"
        title="Kamppi"
        list={list}
        {...props}
      />,
      { messages },
    );

  it('should render a visible label associated with the input', () => {
    const { container } = renderDropdown();
    const label = container.querySelector('label');
    const input = container.querySelector('input');
    expect(label.textContent).toBe('Test dropdown');
    expect(label.htmlFor).toBe('aria-input-test-dropdown');
    expect(input.id).toBe('aria-input-test-dropdown');
  });

  it('should display the title when no value is selected', () => {
    const { container } = renderDropdown();
    expect(container.querySelector('.dd__placeholder').textContent).toContain(
      'Kamppi',
    );
  });

  it('should display the selected option value', () => {
    const { container } = renderDropdown({ value: 'rautatientori' });
    expect(container.querySelector('.dd__single-value').textContent).toContain(
      'Rautatientori',
    );
  });

  it('should clear an invalid controlled value', () => {
    const { container } = renderDropdown({ value: 'unknown' });
    expect(container.querySelector('.dd__single-value')).toBeNull();
  });

  it('should use the right-aligned class prefix when requested', () => {
    const { container } = renderDropdown({ alignRight: true });
    expect(container.querySelector('.dd-right__control')).not.toBeNull();
  });

  it('should call onSelectChange with the selected value', () => {
    let selectedValue;
    handleScheduleDropdownChange({ value: 'rautatientori' }, value => {
      selectedValue = value;
    });
    expect(selectedValue).toBe('rautatientori');
  });

  it('should update the displayed value when the controlled value changes', () => {
    const { container, rerender } = renderDropdown({ value: 'kamppi' });
    expect(container.querySelector('.dd__single-value').textContent).toContain(
      'Kamppi',
    );
    rerender(
      <ScheduleDropdown
        id="test-dropdown"
        title="Kamppi"
        list={list}
        value="rautatientori"
      />,
    );
    expect(container.querySelector('.dd__single-value').textContent).toContain(
      'Rautatientori',
    );
  });
});

describe('scheduleDropdownUtils', () => {
  it('should return the expected class name prefixes', () => {
    expect(getClassNamePrefix(true, 'other-dates')).toBe('dd-timerange');
    expect(getClassNamePrefix(true, 'some-dropdown')).toBe('dd-right');
    expect(getClassNamePrefix(false, 'any-id')).toBe('dd');
  });

  it('should create the accessibility message handlers', () => {
    const intl = {
      formatMessage: ({ id }) =>
        id === 'route-page.pattern-chosen' ? 'Selected:' : id,
    };
    const messages = getAriaMessages(intl);
    expect(Object.keys(messages)).toEqual(
      expect.arrayContaining(['guidance', 'onChange', 'onFilter', 'onFocus']),
    );
    expect(messages.onChange({ value: { label: 'Test Stop' } })).toContain(
      'Selected:',
    );
  });
});
