import SimpleOpeningHours from 'simple-opening-hours';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../../Icon';

export default class OSMOpeningHours extends React.Component {
  constructor() {
    super();
    this.state = { dropDownIsOpen: false };
  }

  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    openingHours: PropTypes.string.isRequired,
    displayStatus: PropTypes.bool,
  };

  static defaultProps = {
    displayStatus: false,
  };

  getOpeningHours = opening => {
    const { intl } = this.context;
    const weekdays = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su', 'ph'];
    const openingTable = opening.getTable();
    const closed = intl.formatMessage({
      id: 'closed',
      defaultMessage: 'Closed',
    });

    const isAlwaysOpen = this.props.openingHours.trim() === '24/7';
    if (isAlwaysOpen) {
      return (
        <div>
          {intl.formatMessage({
            id: 'open-24-7',
            defaultMessage: 'Open 24/7',
          })}
        </div>
      );
    }

    const makeRow = day => {
      let hours;
      if (openingTable[day].length === 0) {
        hours = [closed];
      } else {
        hours = openingTable[day];
      }
      return (
        <tr key={day} className="opening-hours-row">
          <td>
            {intl.formatMessage({
              id: `weekday-${day}`,
              defaultMessage: day,
            })}
          </td>
          <td>
            {hours.map(h => (
              <span key={h}>{h}</span>
            ))}
          </td>
        </tr>
      );
    };

    return (
      <table>
        <tbody>{weekdays.map(makeRow)}</tbody>
      </table>
    );
  };

  getDropDownButton = () => {
    const onClick = () => {
      const newState = { dropDownIsOpen: !this.state.dropDownIsOpen };
      this.setState(newState);
    };

    return (
      <button onClick={onClick}>
        {!this.state.dropDownIsOpen ? (
          <Icon
            className="opening-hours-dropdown-icon"
            img="icon-icon_drop_down"
          />
        ) : (
          <Icon
            className="opening-hours-dropdown-icon"
            img="icon-icon_drop_up"
          />
        )}
      </button>
    );
  };

  render() {
    const opening = new SimpleOpeningHours(this.props.openingHours);
    const { displayStatus } = this.props;
    const isOpenNow = opening.isOpen();

    return (
      <div className="opening-hours">
        <div className="opening-hours-header">
          <Icon
            className="opening-hours-schedule-icon"
            img="icon-icon_schedule"
          />
          {displayStatus ? (
            <span className="currently-open">
              <FormattedMessage id="now" defaultMessage="Now" />{' '}
              <strong>
                {isOpenNow ? (
                  <FormattedMessage id="open" defaultMessage="open" />
                ) : (
                  <FormattedMessage id="closed" defaultMessage="closed" />
                )}
              </strong>
            </span>
          ) : (
            <h4>
              <FormattedMessage
                id="opening-hours"
                defaultMessage="Opening hours"
              />
            </h4>
          )}
          {this.getDropDownButton()}
        </div>
        {this.state.dropDownIsOpen && (
          <div>{this.getOpeningHours(opening)}</div>
        )}
      </div>
    );
  }
}
