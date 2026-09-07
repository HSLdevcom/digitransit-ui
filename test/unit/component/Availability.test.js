import React from 'react';
import { render } from '@testing-library/react';
import Availability from '../../../app/component/Availability';

describe('<Availability />', () => {
  it('should render text', () => {
    const props = {
      available: 1,
      total: 3,
      fewAvailableCount: 3,
      fewerAvailableCount: 2,
      text: <p className="test-text">foo</p>,
      showStatusBar: true,
    };
    const { container } = render(<Availability {...props} />);
    expect(container.querySelector('.test-text').textContent).to.equal('foo');
  });

  it('should render status bar when showStatusBar is true', () => {
    const props = {
      available: 2,
      total: 3,
      fewAvailableCount: 2,
      fewerAvailableCount: 1,
      text: <p className="test-text">foo</p>,
      showStatusBar: true,
    };
    const { container } = render(<Availability {...props} />);
    expect(container.querySelectorAll('.available-few')).to.have.lengthOf(1);
    expect(container.querySelectorAll('.available-none')).to.have.lengthOf(1);
  });

  it('should not render status bar when showStatusBar is false', () => {
    const props = {
      available: 2,
      total: 3,
      fewAvailableCount: 3,
      fewerAvailableCount: 3,
      text: <p className="test-text">foo</p>,
      showStatusBar: false,
    };
    const { container } = render(<Availability {...props} />);
    expect(container.querySelectorAll('.available-few')).to.have.lengthOf(0);
    expect(container.querySelectorAll('.available-none')).to.have.lengthOf(0);
  });
});
