import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import ResultsProgressBar from '../../../../app/component/trafficnow/components/ResultsProgressBar';

describe('<ResultsProgressBar />', () => {
  describe('Percentage calculation', () => {
    it('sets inner fill width to 0% when totalAmount is 0', () => {
      const wrapper = shallow(
        <ResultsProgressBar currentAmount={0} totalAmount={0} />,
      );
      const innerDiv = wrapper.find('div').at(1);
      expect(innerDiv.prop('style').width).to.equal('0%');
    });

    it('computes the correct percentage width (50 of 100 = 50%)', () => {
      const wrapper = shallow(
        <ResultsProgressBar currentAmount={50} totalAmount={100} />,
      );
      const innerDiv = wrapper.find('div').at(1);
      expect(innerDiv.prop('style').width).to.equal('50%');
    });

    it('caps the percentage at 100% when currentAmount exceeds totalAmount', () => {
      const wrapper = shallow(
        <ResultsProgressBar currentAmount={150} totalAmount={100} />,
      );
      const innerDiv = wrapper.find('div').at(1);
      expect(innerDiv.prop('style').width).to.equal('100%');
    });
  });
});
