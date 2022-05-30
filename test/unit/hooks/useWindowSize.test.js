/**
 *
 */
import React from 'react';
import { shallow } from 'enzyme';
import useWindowSize from '../../../app/hooks/useWindowSize';

const TestComp = () => {
  const size = useWindowSize();
  return (
    <span
      size={size}
      width={size.width}
      height={size.height}
      outerWidth={size.outer.width}
      outerHeight={size.outer.height}
    />
  );
};

describe('useWindowSize()', () => {
  it('should return browser window size', () => {
    const comp = shallow(<TestComp />);
    expect(comp.find('span').prop('size')).to.deep.equal({
      width: 1024,
      height: 768,
      outer: {
        width: 1024,
        height: 768,
      },
    });
  });
});
