import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import RightOffcanvasToggle from './RightOffcanvasToggle';
import DatetimepickerContainer from './DatetimepickerContainer';

class AltTravelBar extends React.Component {
  static propTypes = {
    toggleSettings: PropTypes.func.isRequired,
  };
  /* eslint-enable react/no-unused-prop-types */

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = {};

  render() {
    const { toggleSettings } = this.props;

    return (
      <div className={cx(['quicksettings-container'])}>
        <div className="datetimepicker-container">
          <DatetimepickerContainer
            realtime={false}
            embedWhenClosed={
              !this.context.config.hideItinerarySettings && (
                <div className="open-advanced-settings">
                  <RightOffcanvasToggle onToggleClick={toggleSettings} />
                </div>
              )
            }
            embedWhenOpen={
              <div className="open-embed-container">
                <div className="open-advanced-settings open-embed">
                  {!this.context.config.hideItinerarySettings && (
                    <RightOffcanvasToggle onToggleClick={toggleSettings} />
                  )}
                </div>
              </div>
            }
            color={this.context.config.colors.primary}
          />
        </div>
      </div>
    );
  }
}

export default AltTravelBar;
