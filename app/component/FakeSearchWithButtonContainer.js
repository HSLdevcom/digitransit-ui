import React from 'react';
import getContext from 'recompose/getContext';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import FakeSearchBar from './FakeSearchBar';

export const FakeSearchWithButton = ({ fakeSearchBar, onClick, breakpoint }) => (
  <div className={`row search-form bp-${breakpoint}`}>
    <div className="small-12 columns search-form-map-overlay">
      <button title="haku" tabIndex="0" onClick={onClick} className="noborder search-button flex-horisontal">
        <div className="flex-grow row collapse postfix-radius">
          <div className="small-11 columns">
            {fakeSearchBar}
          </div>
          <div className="small-1 columns">
            <span className="postfix search cursor-pointer button-icon">
              <Icon img="icon-icon_search" />
            </span>
          </div>
        </div>
      </button>
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

export default getContext({ breakpoint: React.PropTypes.string.isRequired })(FakeSearchWithButton);
