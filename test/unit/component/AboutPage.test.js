import React from 'react';
import AboutPage from '../../../app/component/AboutPage';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

describe('<AboutPage />', () => {
  const config = {
    CONFIG: 'default',
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
    const wrapper = mountWithIntl(<AboutPage />, {
      config: { ...config, language: 'fi' },
    });
    expect(wrapper.find('p').first().text()).to.equal('foo1'); //eslint-disable-line
    expect(wrapper.find('p').last().text()).to.equal('foo2'); //eslint-disable-line
    expect(wrapper.find('.about-header').first().text()).to.equal('header1'); //eslint-disable-line
    expect(wrapper.find('.about-header').last().text()).to.equal('header2'); //eslint-disable-line
  });

  it('should render external links', () => {
    const wrapper = mountWithIntl(<AboutPage />, {
      config: { ...config, language: 'fi' },
    });
    expect(wrapper.find('a').first().prop('href')).to.equal('foo1.com'); //eslint-disable-line
  });

  it('should obey language selection', () => {
    const wrapper = mountWithIntl(<AboutPage />, {
      config: { ...config, language: 'sv' },
    });
    expect(wrapper.find('.about-header').first().text()).to.equal('sv_header1'); //eslint-disable-line
    expect(wrapper.find('p').first().text()).to.equal('sv_foo1'); //eslint-disable-line
  });
});
