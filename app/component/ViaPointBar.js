import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

import ViaPointSearchModal from './ViaPointSearchModal';
import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';
import ComponentUsageExample from './ComponentUsageExample';

export default function ViaPointBar({
  intermediatePlaces, openSearchModal, removeViaPoint, className,
}) {
  return (
    <div>
      <div className={cx('via-point-bar', className)}>
        { intermediatePlaces && (
          <div className="via-point">
            <FormattedMessage
              id="via-point"
              defaultMessage="Via point"
              className="via-point-header"
            />
            <button className="noborder link-name" onClick={openSearchModal}>
              <span>
                {otpToLocation(intermediatePlaces).address}
              </span>
            </button>
            <button className="noborder icon-button" onClick={removeViaPoint}>
              <Icon img="icon-icon_close" />
            </button>
          </div>
        )}
      </div>
      <ViaPointSearchModal />
    </div>
  );
}

ViaPointBar.propTypes = {
  className: React.PropTypes.string,
  openSearchModal: React.PropTypes.func.isRequired,
  removeViaPoint: React.PropTypes.func.isRequired,
  intermediatePlaces: React.PropTypes.oneOfType([
    React.PropTypes.oneOf([false]),
    React.PropTypes.string,
    React.PropTypes.arrayOf(React.PropTypes.string),
  ]).isRequired,
};

ViaPointBar.defaultProps = {
  className: false,
  intermediatePlaces: false,
};

const emptyFunction = () => {};

ViaPointBar.description = () => (
  <div>
    <p>
      Via point selector
    </p>
    <ComponentUsageExample description="empty">
      <ViaPointBar
        openSearchModal={emptyFunction}
        removeViaPoint={emptyFunction}
        intermediatePlaces={false}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with place">
      <ViaPointBar
        openSearchModal={emptyFunction}
        removeViaPoint={emptyFunction}
        intermediatePlaces={'Opastinsilta 6, Helsinki::60.199087,24.940641'}
      />
    </ComponentUsageExample>
  </div>
);
