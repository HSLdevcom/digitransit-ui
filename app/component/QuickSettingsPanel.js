import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import RightOffcanvasToggle from './RightOffcanvasToggle';
import { matchQuickOption } from '../util/planParamUtil';
import DatetimepickerContainer from './DatetimepickerContainer';

class QuickSettingsPanel extends React.Component {
  // TODO decide if these are needed for new datepicker
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    timeSelectorStartTime: PropTypes.number,
    timeSelectorEndTime: PropTypes.number,
    timeSelectorServiceTimeRange: PropTypes.object.isRequired,
    toggleSettings: PropTypes.func.isRequired,
  };
  /* eslint-enable react/no-unused-prop-types */

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  state = {};

  render() {
    const quickOption = matchQuickOption(this.context);
    const { toggleSettings } = this.props;

    return (
      <div className={cx(['quicksettings-container'])}>
        <DatetimepickerContainer
          realtime={false}
          embedWhenClosed={
            <div className="open-advanced-settings">
              <RightOffcanvasToggle
                onToggleClick={toggleSettings}
                hasChanges={
                  quickOption === 'saved-settings' ||
                  quickOption === 'custom-settings'
                }
              />
            </div>
          }
        />
      </div>
    );
  }
}

export default QuickSettingsPanel;
