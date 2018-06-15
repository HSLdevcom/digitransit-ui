import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { before, describe, it } from 'mocha';
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
});
