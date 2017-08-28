import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import get from 'lodash/get';
import RelativeDuration from './RelativeDuration';
import Icon from './Icon';

export default class PrintableItineraryHeader extends React.Component {
  getFareId = () => {
    const fareId = this.props.itinerary.fares
      ? this.props.itinerary.fares[0].components[0].fareId
      : null;
    const fareMapping = get(this.context.config, 'fareMapping', {});
    const mappedFareId = fareId ? fareMapping[fareId] : null;
    return mappedFareId;
  };

  createHeaderBlock = obj =>
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
            id={`itinerary-${obj.name}.title`}
            defaultMessage={`${obj.name}`}
          />
        </div>
        <div className={obj.name === 'ticket' && `faretype-span`}>
          <span className="header-details-content">
            {obj.contentDetails}
          </span>
        </div>
      </div>
    </div>;

  render() {
    console.log(this.props.itinerary);
    const fare = this.getFareId();
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
                id="journeyplanner.title"
                defaultMessage="Journey Planner"
              />
              {` — `}
              <FormattedMessage
                id="itinerary-page.title"
                defaultMessage="Itinerary"
              />
            </div>
            <div className="subheader">
              <span>
                {this.props.itinerary.legs[0].from.name}
              </span>
              {` - `}
              <span>
                {
                  this.props.itinerary.legs[
                    this.props.itinerary.legs.length - 1
                  ].to.name
                }
              </span>
              {` | `}
              <span>
                {weekDayUpperCase}
              </span>
              {` `}
              <span>
                {moment(this.props.itinerary.startTime)
                  .lang(language)
                  .format('DD.M.YYYY')}
              </span>
            </div>
          </div>
          <div className="print-itinerary-header-logo">Logo</div>
        </div>
        <div className="print-itinerary-header-bottom">
          {this.createHeaderBlock({
            name: 'time',
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
            contentDetails: displayDistance(
              this.props.itinerary.walkDistance,
              this.context.config,
            ),
          })}
          {this.createHeaderBlock({
            name: 'ticket',
            contentDetails: (
              <FormattedMessage
                id={`ticket-type-${fare}`}
                defaultMessage={fare}
              />
            ),
          })}
        </div>
      </div>
    );
  }
}

PrintableItineraryHeader.propTypes = {
  location: PropTypes.object,
  itinerary: PropTypes.object.isRequired,
};

PrintableItineraryHeader.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
