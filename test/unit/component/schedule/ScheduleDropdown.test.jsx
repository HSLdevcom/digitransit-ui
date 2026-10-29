import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';

describe('<ScheduleDropdown />', () => {
  const list = [
    { label: 'Kamppi', value: 0 },
    { label: 'Rautatientori', value: 1 },
  ];
  const messages = { 'test-dropdown': 'Test dropdown' };
  const renderDropdown = props =>
    renderWithProviders(
      <ScheduleDropdown
        id="test-dropdown"
        title="Title"
        list={list}
        {...props}
      />,
      { messages },
    );

  it('should render a visible label associated with the trigger', () => {
    const { container } = renderDropdown();
    const label = container.querySelector('label');
    const trigger = container.querySelector('button');
    expect(label.textContent).toBe('Test dropdown');
    expect(label.htmlFor).toBe('aria-input-test-dropdown');
    expect(trigger.id).toBe('aria-input-test-dropdown');
  });

  it('should display the title when no value is selected', () => {
    const { container } = renderDropdown();
    expect(container.querySelector('button').textContent).toBe('Title');
  });

  it('should display the selected option', () => {
    const { container } = renderDropdown({ value: 1 });
    expect(container.querySelector('button').textContent).toBe('Rautatientori');
  });

  it('should fall back to the title for an unknown value', () => {
    const { container } = renderDropdown({ value: 5 });
    expect(container.querySelector('button').textContent).toBe('Title');
  });

  it('should call onSelectChange with the original option value', () => {
    const onSelectChange = vi.fn();
    const { getByRole } = renderDropdown({
      value: 0,
      onSelectChange,
    });
    fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' });
    fireEvent.click(getByRole('option', { name: 'Rautatientori' }));
    expect(onSelectChange).toHaveBeenCalledWith(1);
  });
});
