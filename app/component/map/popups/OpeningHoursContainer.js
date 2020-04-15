import { SimpleOpeningHours } from 'simple-opening-hours';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Moment from 'moment';

export default class OpeningHoursContainer extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  getOpeningHours = opening => {
    const { intl } = this.context;
    const openingTable = opening.getTable();
    const { mo, tu, we, th, fr, sa, su, ph } = openingTable;

    const closed = intl.formatMessage({
      id: 'closed',
      defaultMessage: 'Closed',
    });

    return (
      <p>
        {intl.formatMessage({
          id: 'monday',
          defaultMessage: 'Monday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {mo.length === 0 ? closed : mo}
        </span>
        <br />
        {intl.formatMessage({
          id: 'tuesday',
          defaultMessage: 'Tuesday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {tu.length === 0 ? closed : tu}
        </span>
        <br />
        {intl.formatMessage({
          id: 'wednesday',
          defaultMessage: 'Wednesday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {we.length === 0 ? closed : we}
        </span>
        <br />
        {intl.formatMessage({
          id: 'thursday',
          defaultMessage: 'Thursday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {th.length === 0 ? closed : th}
        </span>
        <br />
        {intl.formatMessage({
          id: 'friday',
          defaultMessage: 'Friday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {fr.length === 0 ? closed : fr}
        </span>
        <br />
        {intl.formatMessage({
          id: 'saturday',
          defaultMessage: 'Saturday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {sa.length === 0 ? closed : sa}
        </span>
        <br />
        {intl.formatMessage({
          id: 'sunday',
          defaultMessage: 'Sunday',
        })}{' '}
        <span className="popup-opening-hours-times">
          {su.length === 0 ? closed : su}
        </span>
        <br />
        {intl.formatMessage({
          id: 'public-holidays',
          defaultMessage: 'Public holidays',
        })}{' '}
        <span className="popup-opening-hours-times">
          {ph.length === 0 ? closed : ph}
        </span>
      </p>
    );
  };

  render() {
    const opening = new SimpleOpeningHours(
      this.state.feature.properties.opening_hours,
    );
    const isOpenNow = opening.isOpenNow();

    /*
    const timeLeftTilClose = Moment.utc(
      Moment(intervals[0][1], 'DD/MM/YYYY HH:mm').diff(
        Moment(NOW, 'DD/MM/YYYY HH:mm'),
        'minutes',
      ),
    );
    const isClosingSoon = isOpenNow && timeLeftTilClose < 30;
    */

    return (
      <div className="padding-vertical-small">
        <div>
          <FormattedMessage id="now" defaultMessage="Now" />{' '}
          <b>
            {isOpenNow ? (
              <FormattedMessage id="open" defaultMessage="open" />
            ) : (
              <FormattedMessage id="closed" defaultMessage="closed" />
            )}
          </b>
          {isClosingSoon ? (
            <span className="popup-closes-soon">
              <FormattedMessage id="closes-soon" defaultMessage="Closes soon" />
            </span>
          ) : (
            ''
          )}
        </div>
        <div>
          <p>
            <FormattedMessage
              id="opening-hours"
              defaultMessage="Opening hours"
            />:
          </p>
          {this.getOpeningHours(opening)}
        </div>
      </div>
    );
  }
}
