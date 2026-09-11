import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render } from '@testing-library/react';
import ResultsProgressBar from '../../../../app/component/trafficnow/components/ResultsProgressBar';

describe('<ResultsProgressBar />', () => {
  describe('Percentage calculation', () => {
    it('sets inner fill width to 0% when totalAmount is 0', () => {
      const { container } = render(
        <ResultsProgressBar currentAmount={0} totalAmount={0} />,
      );
      const innerDiv = container.querySelectorAll('div')[1];
      expect(innerDiv.style.width).to.equal('0%');
    });

    it('computes the correct percentage width (50 of 100 = 50%)', () => {
      const { container } = render(
        <ResultsProgressBar currentAmount={50} totalAmount={100} />,
      );
      const innerDiv = container.querySelectorAll('div')[1];
      expect(innerDiv.style.width).to.equal('50%');
    });

    it('caps the percentage at 100% when currentAmount exceeds totalAmount', () => {
      const { container } = render(
        <ResultsProgressBar currentAmount={150} totalAmount={100} />,
      );
      const innerDiv = container.querySelectorAll('div')[1];
      expect(innerDiv.style.width).to.equal('100%');
    });
  });
});
