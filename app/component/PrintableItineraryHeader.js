import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import RelativeDuration from './RelativeDuration';
import Icon from './Icon';

export default class PrintableItineraryHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.itinerary,
    };
  }

  render() {
    console.log(this.props.itinerary);
    const duration = moment(this.props.itinerary.endTime).diff(
      moment(this.props.itinerary.startTime),
    );
    const language = this.context.getStore('PreferencesStore').getLanguage();
    return (
      <div className="print-itinerary-header-container">
        <div className="print-itinerary-header-top">
          <div className="header">
            <FormattedMessage
              id="journeyplanner.title"
              defaultMessage="Journey Planner"
            />
            -
            <FormattedMessage
              id="itinerary-page.title"
              defaultMessage="Itinerary"
            />
          </div>
        </div>
        <div className="print-itinerary-header-logo">Logo</div>
        <div className="print-itinerary-header-middle">
          <span>{this.props.itinerary.legs[0].from.name}</span>
          -
          <span>
            {
              this.props.itinerary.legs[this.props.itinerary.legs.length - 1].to
                .name
            }
          </span>
          |
          <span>
            {moment(this.props.itinerary.startTime)
              .lang(language)
              .format('dddd')}
          </span>
          <span>
            {moment(this.props.itinerary.startTime)
              .lang(language)
              .format('DD.M.YYYY')}
          </span>
        </div>
        <div className="print-itinerary-header-bottom">
          <div className="itinerary-time">
            <div className="header-time-icon">
              <Icon img="icon-icon_time" className="itinerary-icon time" />
            </div>
            <div className="header-time-details">
              <FormattedMessage
                id="itinerary-duration"
                defaultMessage="Duration"
              />
              <span>
                <RelativeDuration duration={duration} />
              </span>
              <span>
                {` // ${moment(this.props.itinerary.startTime).format(
                  'HH:mm',
                )}`}
              </span>
              {` - ${moment(this.props.itinerary.endTime).format('HH:mm')}`}
            </div>
          </div>
          <div className="walking-amount" />
          <div className="header-walk-icon">
            <Icon img="icon-icon_time" className="itinerary-icon time" />
          </div>
          <div className="header-time-details">
            <FormattedMessage
              id="itinerary-walk.title"
              defaultMessage="Total walking distance"
            />
            <span>
              {displayDistance(this.props.itinerary.walkDistance, this.context.config)}
            </span>
          </div>
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
