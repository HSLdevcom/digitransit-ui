import React from 'react';
import getContext from 'recompose/getContext';
import Icon from '../icon/Icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import FakeSearchBar from './FakeSearchBar';

const FakeSearchWithButton = ({ fakeSearchBar, onClick, breakpoint }) => (
  <div className={`row search-form bp-${breakpoint}`}>
    <div className="small-12 columns search-form-map-overlay">
      <div className="row collapse postfix-radius">
        <div className="small-11 columns">
          {fakeSearchBar}
        </div>
        <div className="small-1 columns" onClick={onClick}>
          <span className="postfix search cursor-pointer button-icon">
            <Icon img="icon-icon_search" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

FakeSearchWithButton.propTypes = {
  fakeSearchBar: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func,
  breakpoint: React.PropTypes.string,
};

FakeSearchWithButton.defaultProps = {
  breakpoint: 'medium',
};

FakeSearchWithButton.displayName = 'FakeSearchWithButton';

FakeSearchWithButton.description = () => (
  <div>
    <p>
      Visual search component that acts as a link to search dialog.
    </p>
    <ComponentUsageExample description="Centered fake search field with search icon button">
      <FakeSearchWithButton fakeSearchBar={<FakeSearchBar placeholder="Enter address" />} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Centered fake search field with search icon button">
      <FakeSearchWithButton
        breakpoint="large" fakeSearchBar={<FakeSearchBar placeholder="Enter address" />}
      />
    </ComponentUsageExample>
  </div>);

const FakeSearchWithButtonWithBreakpoint =
    getContext({ breakpoint: React.PropTypes.string.isRequired })(FakeSearchWithButton);

export { FakeSearchWithButton, FakeSearchWithButtonWithBreakpoint as default };
