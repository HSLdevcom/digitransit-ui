import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import MessageBarMessage from '../../../app/component/MessageBarMessage';

describe('<MessageBarMessage />', () => {
  const opts = { config: { CONFIG: 'hsl', URL: {}, showAlertHeader: true } };

  it('should not render tag "a" if the href is missing', () => {
    const props = {
      content: [{ type: 'a', content: 'This is a link', href: undefined }],
      breakpoint: 'small',
      onShowMore: () => {},
    };
    const { container } = renderWithProviders(
      <MessageBarMessage {...props} />,
      opts,
    );
    expect(container.querySelectorAll('a')).to.have.lengthOf(0);
  });

  it('should render tag "h2" for type "heading"', () => {
    const props = {
      content: [{ type: 'heading', content: 'This is a header' }],
      breakpoint: 'small',
      onMaximize: () => {},
      onShowMore: () => {},
    };
    const { container } = renderWithProviders(
      <MessageBarMessage {...props} />,
      opts,
    );
    expect(container.querySelector('h2').textContent).to.equal(
      'This is a header',
    );
  });

  it('should render text for type "text"', () => {
    const props = {
      content: [{ type: 'text', content: 'This is text' }],
      breakpoint: 'small',
      onShowMore: () => {},
    };
    const { container } = renderWithProviders(
      <MessageBarMessage {...props} />,
      opts,
    );
    expect(container.querySelector('.message-content').textContent).to.include(
      'This is text',
    );
  });
});
