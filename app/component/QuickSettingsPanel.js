import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import RightOffcanvasToggle from './RightOffcanvasToggle';
import { matchQuickOption } from '../util/planParamUtil';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import Datetimepicker from './Datetimepicker';

class QuickSettingsPanel extends React.Component {
  // TODO decide if these are needed for new datepicker
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    timeSelectorStartTime: PropTypes.number,
    timeSelectorEndTime: PropTypes.number,
    timeSelectorServiceTimeRange: PropTypes.object.isRequired,
  };
  /* eslint-enable react/no-unused-prop-types */

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  state = {};

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  getOffcanvasState = () =>
    (this.context.match.location.state &&
      this.context.match.location.state.customizeSearchOffcanvas) ||
    false;

  setArriveBy = ({ target }) => {
    const arriveBy = target.value;
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: arriveBy === 'true' ? 'SelectArriving' : 'SelectLeaving',
    });
    replaceQueryParams(this.context.router, this.context.match, { arriveBy });
  };

  toggleCustomizeSearchOffcanvas = () => {
    addAnalyticsEvent({
      action: 'OpenSettings',
      category: 'ItinerarySettings',
      name: null,
    });
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  internalSetOffcanvas = newState => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ExtraSettingsPanelClick',
      name: newState ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });

    if (newState) {
      this.context.router.push({
        ...this.context.match.location,
        state: {
          ...this.context.match.location.state,
          customizeSearchOffcanvas: newState,
        },
      });
    } else {
      this.context.router.go(-1);
    }
  };

  render() {
    const quickOption = matchQuickOption(this.context);

    return (
      <div className={cx(['quicksettings-container'])}>
        <Datetimepicker realtime={false} />

        <div className="open-advanced-settings">
          <RightOffcanvasToggle
            onToggleClick={this.toggleCustomizeSearchOffcanvas}
            hasChanges={
              quickOption === 'saved-settings' ||
              quickOption === 'custom-settings'
            }
          />
        </div>
      </div>
    );
  }
}

export default QuickSettingsPanel;
