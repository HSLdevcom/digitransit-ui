import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import get from 'lodash/get';
import { matchShape, routerShape } from 'found';

import Icon from './Icon';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import TimeSelectorContainer from './TimeSelectorContainer';
import { matchQuickOption } from '../util/planParamUtil';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    timeSelectorStartTime: PropTypes.number,
    timeSelectorEndTime: PropTypes.number,
    timeSelectorServiceTimeRange: PropTypes.object.isRequired,
  };

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
    const arriveBy = get(
      this.context.match.location,
      'query.arriveBy',
      'false',
    );
    const quickOption = matchQuickOption(this.context);

    return (
      <div className={cx(['quicksettings-container'])}>
        <div className={cx('time-selector-settings-row')}>
          <TimeSelectorContainer
            startTime={this.props.timeSelectorStartTime}
            endTime={this.props.timeSelectorEndTime}
            serviceTimeRange={this.props.timeSelectorServiceTimeRange}
          />
          <div className="select-wrapper">
            <select
              aria-label={this.context.intl.formatMessage({
                id: 'arrive-leave',
                defaultMessage: 'Arrive or leave at selected time',
              })}
              className="arrive"
              value={arriveBy}
              onChange={this.setArriveBy}
            >
              <option value="false">
                {this.context.intl.formatMessage({
                  id: 'leaving-at',
                  defaultMessage: 'Leaving',
                })}
              </option>
              <option value="true">
                {this.context.intl.formatMessage({
                  id: 'arriving-at',
                  defaultMessage: 'Arriving',
                })}
              </option>
            </select>
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>

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
      </div>
    );
  }
}

export default QuickSettingsPanel;
