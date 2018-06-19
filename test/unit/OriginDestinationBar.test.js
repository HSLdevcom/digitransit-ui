import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { before, describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import OriginDestinationBar from '../../app/component/OriginDestinationBar';

describe('<OriginDestinationBar />', () => {
  const exampleViapoints = [
    'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
    'Kamppi 1241, Helsinki::60.169119,24.932058',
    'Museokatu 5, Helsinki::60.174856,24.929014',
  ];

  const exampleSingleViapoint = [
    'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
  ];

  const exampleQuery =
    'intermediatePlaces=Kluuvi%2C+luoteinen%2C+Kluuvi%2C+Helsinki%3A%3A60.173123%2C24.948365&intermediatePlaces=Kamppi+1241%2C+Helsinki%3A%3A60.169119%2C24.932058';

  const mockFunction = () => {
    const calls = [];
    const fn = (...args) => calls.push(args);
    fn.calls = calls;
    return fn;
  };

  let wrapper;
  let wrapperNoParams;

  before(() => {
    wrapper = shallow(<OriginDestinationBar />, {
      context: {
        location: { query: exampleQuery },
        router: { replace: mockFunction },
      },
    });
    wrapperNoParams = shallow(<OriginDestinationBar />, {
      context: {
        location: { query: '' },
        router: { replace: mockFunction },
      },
    });
  });

  it('should initialize viapoints from url', () => {
    wrapper.setState({ isViaPoint: true, viaPointNames: exampleViapoints });
    expect(wrapper.state('viaPointNames')).to.equal(exampleViapoints);
  });

  it('should add a new viapoint to a set index and save the state', () => {
    const testIndex =
      exampleViapoints[Math.floor(Math.random() * exampleViapoints.length)];

    wrapper.setState({ isViaPoint: true, viaPointNames: exampleViapoints });
    wrapper.instance().addMoreViapoints(testIndex);
    exampleViapoints.splice(testIndex + 1, 0, ' ');

    expect(toString(wrapper.state('viaPointNames'))).to.equal(
      toString(exampleViapoints),
    );
  });

  it('should remove one viapoint by set index', () => {
    const testIndex =
      exampleViapoints[Math.floor(Math.random() * exampleViapoints.length)];

    wrapper.setState({ isViaPoint: true, viaPointNames: exampleViapoints });
    wrapper.instance().removeViapoints(testIndex);
    expect(toString(wrapper.state('viaPointNames'))).to.equal(
      toString(exampleViapoints.filter((o, i) => i !== testIndex)),
    );
  });

  it('should render an add viapoint button that sets viapoint to true', () => {
    expect(wrapperNoParams.find('.addViaPoint')).to.have.length(1);
    wrapperNoParams.find('.addViaPoint').simulate('click');
    expect(wrapperNoParams.state('isViaPoint')).to.equal(true);
  });

  it('should set isViaPoint to false when all viapoints are removed', () => {
    wrapperNoParams.setState({
      isViaPoint: true,
      viaPointNames: exampleSingleViapoint,
    });
    wrapperNoParams.instance().removeViapoints(0);
    expect(wrapperNoParams.state('isViaPoint')).to.equal(false);
  });

  it('should show the add via point button after removing an empty via point with a keypress', () => {
    const props = {
      initialViaPoints: [' '],
      origin: {},
    };
    const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
      context: {
        ...mockContext,
        location: { query: '' },
        router: { replace: mockFunction },
      },
      childContextTypes: mockChildContextTypes,
    });

    comp.find('.itinerary-search-controls > .addViaPoint').simulate('click');
    comp.find('.removeViaPoint').simulate('keypress', { key: 'Enter' });

    expect(comp.find('.viapoints-list').prop('style')).to.deep.equal({
      display: 'none',
    });
    expect(
      comp.find('.itinerary-search-controls > .addViaPoint').prop('style'),
    ).to.deep.equal({
      display: 'block',
    });
  });

  it('should add a via point after adding and then removing a viapoint with a keypress', () => {
    const props = {
      initialViaPoints: [' '],
      origin: {},
    };
    const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
      context: {
        ...mockContext,
        location: { query: '' },
        router: { replace: mockFunction },
      },
      childContextTypes: mockChildContextTypes,
    });

    comp.find('.itinerary-search-controls > .addViaPoint').simulate('click');
    comp.find('.removeViaPoint').simulate('keypress', { key: 'Enter' });
    comp.find('.itinerary-search-controls > .addViaPoint').simulate('click');

    expect(
      comp.find('.itinerary-search-controls > .addViaPoint').prop('style'),
    ).to.deep.equal({
      display: 'none',
    });
    expect(comp.find('.viapoints-list').length).to.equal(1);
    expect(comp.find('.viapoints-list').prop('style')).to.deep.equal({
      display: 'block',
    });
    expect(comp.find('.removeViaPoint').length).to.equal(1);
  });

  describe('swapEndpoints', () => {
    it('should also swap via points', () => {
      const props = {
        destination: {},
        initialViaPoints: [
          'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
          'Kamppi 1241, Helsinki::60.169119,24.932058',
        ],
        origin: {},
      };
      const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
        context: {
          ...mockContext,
          location: {
            query:
              'intermediatePlaces=Kluuvi%2C+luoteinen%2C+Kluuvi%2C+Helsinki%3A%3A60.173123%2C24.948365&intermediatePlaces=Kamppi+1241%2C+Helsinki%3A%3A60.169119%2C24.932058',
          },
          router: {
            replace: () => {},
          },
        },
        childContextTypes: mockChildContextTypes,
      });

      comp.find('.switch').simulate('click');

      expect(comp.state('viaPointNames')).to.deep.equal([
        'Kamppi 1241, Helsinki::60.169119,24.932058',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ]);
    });
  });
});
