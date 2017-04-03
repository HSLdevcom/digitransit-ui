import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';
import ComponentUsageExample from './ComponentUsageExample';

export default function ViaPointSelector({ intermediatePlaces, openSearchModal, removeViaPoint }) {
  return (
    <section className="offcanvas-section">
      <FormattedMessage
        tagName="h4"
        defaultMessage="Via point"
        id="via-point"
      />
      { intermediatePlaces ?
        <div className="via-point">
          <button className="noborder link-name" onClick={openSearchModal}>
            <span>
              {otpToLocation(intermediatePlaces).address}
            </span>
          </button>
          <button className="noborder icon-button" onClick={removeViaPoint}>
            <Icon img="icon-icon_close" />
          </button>
        </div>
         :
        <button className="noborder cursor-pointer" onClick={openSearchModal}>
          <div className="add-via-point-button-label">
            <Icon img="icon-icon_plus" />
            {'\u00A0\u00A0'}
            <FormattedMessage
              id="add-itinerary-via-point"
              defaultMessage="Add via point for itinerary"
            />
          </div>
        </button>
      }
    </section>
  );
}

ViaPointSelector.propTypes = {
  openSearchModal: React.PropTypes.func.isRequired,
  removeViaPoint: React.PropTypes.func.isRequired,
  intermediatePlaces: React.PropTypes.oneOfType([
    React.PropTypes.oneOf([false]),
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string),
  ]).isRequired,
};

ViaPointSelector.defaultProps = {
  intermediatePlaces: false,
};

const emptyFunction = () => {};

ViaPointSelector.description = () => (
  <div>
    <p>
      Via point selector
    </p>
    <div className="customize-search">
      <ComponentUsageExample description="empty">
        <ViaPointSelector
          openSearchModal={emptyFunction}
          removeViaPoint={emptyFunction}
          intermediatePlaces={false}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="with place">
        <ViaPointSelector
          openSearchModal={emptyFunction}
          removeViaPoint={emptyFunction}
          intermediatePlaces={'Opastinsilta 6, Helsinki::60.199087,24.940641'}
        />
      </ComponentUsageExample>
    </div>
  </div>
);
