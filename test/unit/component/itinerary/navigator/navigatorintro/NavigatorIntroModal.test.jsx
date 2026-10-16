import React from 'react';
import ReactModal from 'react-modal';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../helpers/mock-providers';
import { createTestConfig } from '../../../../helpers/mock-context';
import NavigatorIntroModal from '../../../../../../app/component/itinerary/navigator/navigatorintro/NavigatorIntroModal';

// @hsl-fi/modal's own react-modal instance needs an appElement registered
// before the first render - see digitransit-component-favourite-modal/test.jsx
// for the same pattern/reasoning.
ReactModal.setAppElement(document.querySelector('#app'));

const baseConfig = createTestConfig();

// react-modal's aria-hider can leave aria-hidden stuck on document.body across
// files sharing this worker's jsdom instance (vitest.config.js's isolate: false) -
// guard against leaking that into unrelated test files.
afterEach(() => {
  document.body.removeAttribute('aria-hidden');
});

describe('<NavigatorIntroModal />', () => {
  it('renders the navigator intro content', () => {
    renderWithProviders(
      <NavigatorIntroModal
        onClose={() => {}}
        onOpenGeolocationInfo={() => {}}
      />,
      { config: baseConfig },
    );
    // react-modal renders its content in a portal appended to document.body,
    // outside the container returned by render().
    expect(document.body.textContent).toContain("You'll get assistance");
  });

  it('calls onOpenGeolocationInfo when "Read more" is clicked', () => {
    const onOpenGeolocationInfo = vi.fn();
    renderWithProviders(
      <NavigatorIntroModal
        onClose={() => {}}
        onOpenGeolocationInfo={onOpenGeolocationInfo}
      />,
      { config: baseConfig },
    );
    fireEvent.click(
      Array.from(document.body.querySelectorAll('button')).find(
        button => button.textContent === 'Read more',
      ),
    );
    expect(onOpenGeolocationInfo).toHaveBeenCalledTimes(1);
  });
});
