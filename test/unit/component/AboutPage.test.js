import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import AboutPage from '../../../app/component/AboutPage';

describe('<AboutPage />', () => {
  const config = {
    CONFIG: 'default',
    URL: {},
    aboutThisService: {
      fi: [
        {
          header: 'header1',
          paragraphs: ['foo1'],
          link: 'foo1.com',
        },
        {
          header: 'header2',
          paragraphs: ['foo2'],
        },
      ],
      sv: [
        {
          header: 'sv_header1',
          paragraphs: ['sv_foo1'],
          link: 'sv_foo1.com',
        },
        {
          header: 'sv_header2',
          paragraphs: ['sv_foo2'],
        },
      ],
    },
  };

  it('should render all defined headers and paragraph texts in given order', () => {
    const { container } = renderWithProviders(<AboutPage />, {
      config: { ...config, language: 'fi' },
    });
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs[0].textContent).to.equal('foo1');
    expect(paragraphs[paragraphs.length - 1].textContent).to.equal('foo2');
    const headers = container.querySelectorAll('.about-header');
    expect(headers[0].textContent).to.equal('header1');
    expect(headers[headers.length - 1].textContent).to.equal('header2');
  });

  it('should render external links', () => {
    const { container } = renderWithProviders(<AboutPage />, {
      config: { ...config, language: 'fi' },
    });
    expect(container.querySelector('a').getAttribute('href')).to.equal(
      'foo1.com',
    );
  });

  it('should obey language selection', () => {
    const { container } = renderWithProviders(<AboutPage />, {
      config: { ...config, language: 'sv' },
    });
    expect(container.querySelector('.about-header').textContent).to.equal(
      'sv_header1',
    );
    expect(container.querySelector('p').textContent).to.equal('sv_foo1');
  });
});
