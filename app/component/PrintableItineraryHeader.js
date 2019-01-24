import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import RelativeDuration from './RelativeDuration';
import { renderZoneTicketIcon, isWithinZoneB } from './ZoneTicketIcon';
import PreferencesStore from '../store/PreferencesStore';
import mapFares from '../util/fareUtils';
import { displayDistance } from '../util/geo-utils';
import { getTotalWalkingDistance, getZones } from '../util/legUtils';

class PrintableItineraryHeader extends React.Component {
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
    const { itinerary, language } = this.props;
    const fares = mapFares(itinerary.fares, config, language);
    const isOnlyZoneB = isWithinZoneB(getZones(itinerary.legs), fares);
    const duration = moment(itinerary.endTime).diff(
      moment(itinerary.startTime),
    );
    const weekDay = moment(itinerary.startTime)
      .locale(language)
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
              <span>{itinerary.legs[0].from.name}</span>
              {` — `}
              <span>{itinerary.legs[itinerary.legs.length - 1].to.name}</span>
              {` | `}
              <span>{weekDayUpperCase}</span>
              {` `}
              <span>
                {moment(itinerary.startTime)
                  .locale(language)
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
                  {` // ${moment(itinerary.startTime).format('HH:mm')}`}
                  {` - ${moment(itinerary.endTime).format('HH:mm')}`}
                </span>
              </span>
            ),
          })}
          {this.createHeaderBlock({
            name: 'walk',
            textId: 'walk',
            contentDetails: displayDistance(
              getTotalWalkingDistance(itinerary),
              config,
            ),
          })}
          {fares &&
            this.createHeaderBlock({
              name: 'ticket',
              textId: fares.length > 1 ? 'tickets' : 'ticket',
              contentDetails: fares.map(
                fare =>
                  config.useTicketIcons ? (
                    <React.Fragment key={fare}>
                      {renderZoneTicketIcon(fare, isOnlyZoneB)}
                    </React.Fragment>
                  ) : (
                    <div key={fare} className="fare-details">
                      <span>{fare}</span>
                    </div>
                  ),
              ),
            })}
        </div>
      </div>
    );
  }
}

PrintableItineraryHeader.propTypes = {
  itinerary: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
};

PrintableItineraryHeader.contextTypes = {
  config: PropTypes.object.isRequired,
};

const connectedComponent = connectToStores(
  PrintableItineraryHeader,
  [PreferencesStore],
  ({ getStore }) => ({ language: getStore(PreferencesStore).getLanguage() }),
);

export { connectedComponent as default, PrintableItineraryHeader as Component };
