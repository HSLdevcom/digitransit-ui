import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import uniqBy from 'lodash/uniqBy';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class TimeTableOptionsPanel extends React.Component {
  static propTypes = {
    stop: PropTypes.object.isRequired,
    showRoutes: PropTypes.array,
    showFilterModal: PropTypes.func,
  };

  getRouteNames = routes => {
    const arr = [];
    this.props.stop.stoptimesForServiceDate.forEach(o => {
      if (routes.filter(v => v === o.pattern.code).length > 0) {
        arr.push({
          id: o.pattern.code,
          shortName: o.pattern.route.shortName,
          agencyName: o.pattern.route.agency.name,
        });
      }
    });
    return uniqBy(arr, key =>
      key.shortName === null ? key.agencyName : key.shortName,
    );
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    if (!this.props.stop) {
      throw Error('Empty stop');
    }
    const routeNames = this.getRouteNames(this.props.showRoutes);
    const showRoutesDiv = routeNames.map(
      (o, i) =>
        `${o.shortName ? o.shortName : o.agencyName}${
          i === routeNames.length - 1 ? '' : ', '
        }`,
    );
    const stopVehicle = this.props.stop.stoptimesForServiceDate[0].pattern.route.mode.toLowerCase();
    return (
      <label
        className="timetable-showroutes combobox-container"
        htmlFor="timetable-showroutes-button"
      >
        <span className="left-column">
          <span className="combobox-label">
            <FormattedMessage
              id="selected-routes"
              defaultMessage="Selected lines"
            />
          </span>
          <button
            type="button"
            id="timetable-showroutes-button"
            className="combobox-selected-value"
            onClick={() => {
              this.props.showFilterModal(true);
              addAnalyticsEvent({
                category: 'Stop',
                action: 'ChooseTimetableRoutes',
                name: null,
              });
            }}
          >
            <span className="showroutes-list">
              {showRoutesDiv.length > 0 && showRoutesDiv}
              {showRoutesDiv.length === 0 && (
                <FormattedMessage id="all-routes" defaultMessage="All Lines" />
              )}
            </span>
          </button>
        </span>
        <div className={`showroutes-icon ${stopVehicle}`}>
          <Icon
            img={`icon-icon_${stopVehicle}`}
            className="showroutes-icon-svg"
          />
        </div>
      </label>
    );
  }
}

export default TimeTableOptionsPanel;
