import SimpleOpeningHours from 'simple-opening-hours';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';

export default class OSMOpeningHours extends React.Component {
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

    const makeRow = day => {
      let hours;
      if (openingTable[day].length === 0) {
        hours = [closed];
      } else {
        hours = openingTable[day];
      }
      return (
        <tr key={day}>
          <td>
            {intl.formatMessage({
              id: `weekday-${day}`,
              defaultMessage: day,
            })}
          </td>
          <td>{hours.map(h => <span key={h}>{h}</span>)}</td>
        </tr>
      );
    };

    return (
      <table>
        <tbody>{weekdays.map(makeRow)}</tbody>
      </table>
    );
  };

  render() {
    const opening = new SimpleOpeningHours(this.props.openingHours);
    const { displayStatus } = this.props;
    const isOpenNow = opening.isOpen();

    return (
      <div className="opening-hours">
        {displayStatus ? (
          <div className="currently-open">
            <FormattedMessage id="now" defaultMessage="Now" />{' '}
            <strong>
              {isOpenNow ? (
                <FormattedMessage id="open" defaultMessage="open" />
              ) : (
                <FormattedMessage id="closed" defaultMessage="closed" />
              )}
            </strong>
          </div>
        ) : (
          ''
        )}
        <div>
          <h4>
            <FormattedMessage
              id="opening-hours"
              defaultMessage="Opening hours"
            />
          </h4>
          {this.getOpeningHours(opening)}
        </div>
      </div>
    );
  }
}
