import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { before, describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import OriginDestinationBar from '../../app/component/OriginDestinationBar';
import { replaceQueryParams } from '../../app/util/queryUtils';

describe('<OriginDestinationBar />', () => {
  const exampleViapoints = [
    'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
    'Kamppi 1241, Helsinki::60.169119,24.932058',
    'Museokatu 5, Helsinki::60.174856,24.929014',
  ];

  const exampleSingleViapoint = [
    'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
  ];

  let wrapper;

  before(() => {
    wrapper = shallow(<OriginDestinationBar />, {
      context: {
        router: createMemoryHistory(),
      },
    });
  });

  // TODO: this component does not initialize anything from the url
  // it('should initialize viapoints from url', () => {
  //   wrapper.setState({ isViaPoint: true, viaPointNames: exampleViapoints });
  //   expect(wrapper.state('viaPointNames')).to.equal(exampleViapoints);
  // });

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
    expect(wrapper.find('.addViaPoint')).to.have.length(1);
    wrapper.find('.addViaPoint').simulate('click');
    expect(wrapper.state('isViaPoint')).to.equal(true);
  });

  it('should set isViaPoint to false when all viapoints are removed', () => {
    wrapper.setState({
      isViaPoint: true,
      viaPointNames: exampleSingleViapoint,
    });
    wrapper.instance().removeViapoints(0);
    expect(wrapper.state('isViaPoint')).to.equal(false);
  });

  it('should show the add via point button after removing an empty via point with a keypress', () => {
    const props = {
      initialViaPoints: [' '],
      origin: {},
    };
    const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
      context: {
        ...mockContext,
        router: createMemoryHistory(),
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
        router: createMemoryHistory(),
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

      const router = createMemoryHistory();
      replaceQueryParams(router, {
        intermediatePlaces: [
          'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
          'Kamppi 1241, Helsinki::60.169119,24.932058',
        ],
      });

      const comp = mountWithIntl(<OriginDestinationBar {...props} />, {
        context: {
          ...mockContext,
          router,
        },
        childContextTypes: mockChildContextTypes,
      });

      comp.find('.switch').simulate('click');

      expect(
        router.getCurrentLocation().query.intermediatePlaces,
      ).to.deep.equal([
        'Kamppi 1241, Helsinki::60.169119,24.932058',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ]);
      expect(comp.state('viaPointNames')).to.deep.equal([
        'Kamppi 1241, Helsinki::60.169119,24.932058',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ]);
    });
  });
});
