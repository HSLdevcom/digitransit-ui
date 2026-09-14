import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import NavigatorIntro from '../../../../../app/component/itinerary/navigator/navigatorintro/NavigatorIntro';

const defaultProps = {
  onClose: () => {},
  onOpenGeolocationInfo: () => {},
};

describe('<NavigatorIntro />', () => {
  it('should render the logo when provided', () => {
    const { container } = renderWithProviders(
      <NavigatorIntro logo="foobar" {...defaultProps} />,
    );
    expect(container.querySelector('.intro-body img')).to.not.equal(null);
  });

  it('should not render a logo when it is not provided', () => {
    const { container } = renderWithProviders(
      <NavigatorIntro {...defaultProps} />,
    );
    expect(container.querySelector('.intro-body img')).to.equal(null);
  });
});
