/* eslint-disable react/no-array-index-key */
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import RelativeDuration from './RelativeDuration';
import { renderZoneTicket } from './ZoneTicket';
import PreferencesStore from '../store/PreferencesStore';
import {
  getFares,
  getAlternativeFares,
  shouldShowFareInfo,
} from '../util/fareUtils';
import { displayDistance } from '../util/geo-utils';
import { getTotalWalkingDistance, getZones, getRoutes } from '../util/legUtils';

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
    const { config, intl } = this.context;
    const { itinerary, language } = this.props;

    const fares = getFares(itinerary.fares, getRoutes(itinerary.legs), config);
    const alternativeFares = getAlternativeFares(
      getZones(itinerary.legs),
      fares.filter(fare => !fare.isUnknown),
      config.availableTickets,
    );
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
              {`${config.title} - ${intl.formatMessage({
                id: 'itinerary-page.title',
                defaultMessage: 'Itinerary',
              })}`}
            </div>
            <div className="subheader">
              <span>{itinerary.legs[0].from.name}</span>
              {itinerary.legs
                .filter(leg => leg.intermediatePlace)
                .map((leg, i) => <span key={i}>{` — ${leg.from.name}`}</span>)}
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
          {fares.length > 0 &&
            shouldShowFareInfo(config) &&
            this.createHeaderBlock({
              name: 'ticket',
              textId: fares.length > 1 ? 'tickets' : 'ticket',
              contentDetails: fares.map(
                ({ isUnknown, routeName, ticketName }, i) =>
                  (isUnknown && (
                    <div key={i} className="fare-details">
                      <span>{routeName}</span>
                    </div>
                  )) ||
                  (config.useTicketIcons && (
                    <React.Fragment key={i}>
                      {renderZoneTicket(ticketName, alternativeFares)}
                    </React.Fragment>
                  )) || (
                    <div key={i} className="fare-details">
                      <span>{ticketName}</span>
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
  intl: intlShape.isRequired,
};

const connectedComponent = connectToStores(
  PrintableItineraryHeader,
  [PreferencesStore],
  ({ getStore }) => ({ language: getStore(PreferencesStore).getLanguage() }),
);

export { connectedComponent as default, PrintableItineraryHeader as Component };
