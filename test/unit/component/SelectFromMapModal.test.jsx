import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import SelectFromMapModal from '../../../app/component/SelectFromMapModal';

describe('<SelectFromMapModal />', () => {
  it('renders the title and children, and tags the overlay/scaler ancestors for full-bleed styling', () => {
    renderWithProviders(
      <SelectFromMapModal title="Select location" lang="en" onClose={() => {}}>
        <div data-testid="map-picker">map picker</div>
      </SelectFromMapModal>,
    );

    expect(screen.getByText('Select location')).toBeTruthy();
    const picker = screen.getByTestId('map-picker');
    expect(picker).toBeTruthy();

    const scaler = picker.closest('.select-from-map-modal-scaler');
    expect(scaler).not.toBeNull();
    expect(scaler.closest('.select-from-map-modal-overlay')).not.toBeNull();
  });

  it('calls onClose when the modal close button is activated', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <SelectFromMapModal title="Select location" lang="en" onClose={onClose}>
        <div>map picker</div>
      </SelectFromMapModal>,
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
