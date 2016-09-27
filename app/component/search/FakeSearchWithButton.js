import React from 'react';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import FakeSearchBar from './FakeSearchBar';

const FakeSearchWithButton = ({ fakeSearchBar, onClick }) => (
  <div className="row search-form">
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
  </div>);


export default FakeSearchWithButton;
