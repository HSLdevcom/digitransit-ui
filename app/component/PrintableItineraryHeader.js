import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import get from 'lodash/get';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { getTotalWalkingDistance } from '../util/legUtils';
import RelativeDuration from './RelativeDuration';
import Icon from './Icon';

export default class PrintableItineraryHeader extends React.Component {
  getFareId = fare => {
    const fareMapping = get(this.context.config, 'fareMapping', {});
    const mappedFareId = fare ? fareMapping[fare.fareId] : null;
    return mappedFareId;
  };

  createHeaderBlock = obj => (
    <div className={`print-itinerary-header-single itinerary-${obj.name}`}>
      <div className="header-icon">
        <Icon
          img={`icon-icon_${obj.name}`}
          className={`itinerary-icon ${obj.name}`}
        />
      </div>
      <div className="header-details">
        <div className="header-details-title">
          <FormattedMessage
            id={`itinerary-${obj.textId}.title`}
            defaultMessage={`${obj.name}`}
          />
        </div>
        <div
          className={obj.name === 'ticket' ? `faretype-container` : undefined}
        >
          <span className="header-details-content">{obj.contentDetails}</span>
        </div>
      </div>
    </div>
  );

  render() {
    const { config } = this.context;
    const fares =
      this.props.itinerary.fares &&
      this.props.itinerary.fares[0].components.length > 0 &&
      this.props.itinerary.fares[0].components.map(o => this.getFareId(o));
    const duration = moment(this.props.itinerary.endTime).diff(
      moment(this.props.itinerary.startTime),
    );
    const language = this.context.getStore('PreferencesStore').getLanguage();
    const weekDay = moment(this.props.itinerary.startTime)
      .lang(language)
      .format('dddd');
    const weekDayUpperCase = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);

    return (
      <div className="print-itinerary-header-container">
        <div className="print-itinerary-header-top">
          <div className="headers-container">
            <div className="header">
              <FormattedMessage
                id="print-itinerary-app-title"
                defaultMessage={config.title}
              />
              {` - `}
              <FormattedMessage
                id="itinerary-page.title"
                defaultMessage="Itinerary"
              />
            </div>
            <div className="subheader">
              <span>{this.props.itinerary.legs[0].from.name}</span>
              {` — `}
              <span>
                {
                  this.props.itinerary.legs[
                    this.props.itinerary.legs.length - 1
                  ].to.name
                }
              </span>
              {` | `}
              <span>{weekDayUpperCase}</span>
              {` `}
              <span>
                {moment(this.props.itinerary.startTime)
                  .lang(language)
                  .format('DD.M.YYYY')}
              </span>
            </div>
          </div>
        </div>
        <div className="print-itinerary-header-bottom">
          {this.createHeaderBlock({
            name: 'time',
            textId: 'time',
            contentDetails: (
              <span>
                <RelativeDuration duration={duration} />
                <span style={{ fontWeight: '400' }}>
                  {` // ${moment(this.props.itinerary.startTime).format(
                    'HH:mm',
                  )}`}
                  {` - ${moment(this.props.itinerary.endTime).format('HH:mm')}`}
                </span>
              </span>
            ),
          })}
          {this.createHeaderBlock({
            name: 'walk',
            textId: 'walk',
            contentDetails: displayDistance(
              getTotalWalkingDistance(this.props.itinerary),
              this.context.config,
            ),
          })}
          {fares &&
            config.showTicketInformation &&
            this.createHeaderBlock({
              name: 'ticket',
              textId: fares.length > 1 ? 'tickets' : 'ticket',
              contentDetails: fares.map(fare => (
                <div key={fare} className="fare-details">
                  <FormattedMessage
                    id={`ticket-type-${fare}`}
                    defaultMessage={fare}
                  />
                </div>
              )),
            })}
        </div>
      </div>
    );
  }
}

PrintableItineraryHeader.propTypes = {
  itinerary: PropTypes.object.isRequired,
};

PrintableItineraryHeader.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
