import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { FormattedMessage, intlShape } from 'react-intl';
import { DateTime, Duration } from 'luxon';
import {
  configShape,
  pickupBookingInfoShape,
  routeShape,
} from '../../util/shapes';
import Icon from '../Icon';
import FavouriteRouteContainer from '../routepage/FavouriteRouteContainer';
import CallAgencyDisclaimer from './CallAgencyDisclaimer';
import { useDeepLink } from '../../util/vehicleRentalUtils';

function OnDemandInfo(
  { routeNumber, route, pickupBookingInfo, mobile, onClose },
  { config, intl },
) {
  const container = mobile
    ? document.getElementById('content-container')
    : document.getElementById('main-content');
  const bookingUrl = pickupBookingInfo.contactInfo?.bookingUrl;
  const infoUrl = pickupBookingInfo.contactInfo?.infoUrl;
  const onClick = bookingUrl?.startsWith('http')
    ? () => {
        window.open(bookingUrl, '_blank', 'noopener,noreferrer');
      }
    : () => useDeepLink(bookingUrl, infoUrl);

  const latestBookingTime = pickupBookingInfo.latestBookingTime?.time;
  const formattedLatestBookingTime =
    latestBookingTime &&
    /^\d{2}:\d{2}:\d{2}$/.test(latestBookingTime) &&
    DateTime.fromFormat(latestBookingTime, 'HH:mm:ss').toFormat('HH:mm');
  const latestBookingTimeText =
    pickupBookingInfo.latestBookingTime?.daysPrior &&
    intl.formatMessage(
      {
        id: 'on-demand-service-prior-notice-days',
        defaultMessage:
          'Order must be placed at least {days} days before the trip, by {time}.',
      },
      {
        days: pickupBookingInfo.latestBookingTime?.daysPrior || '',
        time: formattedLatestBookingTime || latestBookingTime || '',
      },
    );

  const bookingNoticeInMinutes =
    pickupBookingInfo.minimumBookingNotice &&
    Duration.fromISO(pickupBookingInfo.minimumBookingNotice).as('minutes');
  const bookingNoticeInMinutesText =
    bookingNoticeInMinutes &&
    intl.formatMessage(
      {
        id: 'on-demand-service-prior-notice-minutes',
        defaultMessage:
          'Order must be placed at least {minutes} minutes before the trip.',
      },
      { minutes: bookingNoticeInMinutes },
    );

  const bookingTimeText = latestBookingTimeText || bookingNoticeInMinutesText;

  return (
    <>
      {ReactDOM.createPortal(
        <div className="main-content">
          <div className={`back-button on-demand ${mobile ? 'mobile' : ''}`}>
            <button
              type="button"
              className="icon-holder noborder cursor-pointer"
              onClick={onClose}
              aria-label={intl.formatMessage({
                id: 'back-button-title',
                defaultMessage: 'Go back to previous page',
              })}
              tabIndex={0}
            >
              <Icon
                img="icon_arrow-collapse--left"
                color={config.colors.primary}
                className="arrow-icon cursor-pointer"
              />
            </button>
          </div>
          <div className={`on-demand-info-container ${mobile ? 'mobile' : ''}`}>
            <div className="route-header">
              {routeNumber}
              <FavouriteRouteContainer
                className="on-demand-route-page-header"
                gtfsId={route.gtfsId}
              />
            </div>
            <div className="divider top" />
            <div className="on-demand-info-headline">
              <FormattedMessage
                id="booking-method"
                defaultMessage="Booking method"
              />
            </div>
            <div className="on-demand-info-content">
              <FormattedMessage
                id="on-demand-service"
                defaultMessage="On-demand service"
              />
            </div>
            {config.flex.infoLanguage === intl.locale && ( // No translations available in the data
              <div className="on-demand-info-content">
                {pickupBookingInfo.message}
              </div>
            )}
            <div className="on-demand-info-content">
              {bookingTimeText && (
                <div className="booking-notice">{bookingTimeText}</div>
              )}
            </div>
            {infoUrl && (
              <div className="on-demand-info-content external-link">
                <a href={infoUrl} target="_blank" rel="noopener noreferrer">
                  {intl.formatMessage({ id: 'extra-info' })}
                  <Icon img="icon_arrow-collapse--right" omitViewBox />
                </a>
              </div>
            )}
            {bookingUrl && (
              <div className="on-demand-info-content external-link on-demand-booking-button">
                <button
                  type="button"
                  className="external-link-button external-link"
                  onClick={e => {
                    e.stopPropagation();
                    onClick(e);
                  }}
                >
                  {intl.formatMessage({ id: 'open-app' })}
                  <Icon img="icon_arrow-collapse--right" omitViewBox />
                </button>
              </div>
            )}
            <div className="divider" />
            <div className="on-demand-info-headline">
              <FormattedMessage
                id="phone-number"
                defaultMessage="Phone number"
              />
            </div>
            {pickupBookingInfo.contactInfo?.phoneNumber && (
              <div className="on-demand-info-content">
                <div className="phone-section">
                  <a href={`tel:${pickupBookingInfo.contactInfo?.phoneNumber}`}>
                    {pickupBookingInfo.contactInfo?.phoneNumber}
                  </a>
                </div>
              </div>
            )}
            <div className="divider" />
            <div className="on-demand-service">
              <div className="on-demand-info-headline">
                <FormattedMessage
                  id="on-demand-service-description"
                  defaultMessage="On-demand service description"
                />
              </div>
              <div className="on-demand-info-content">
                {route.longName && (
                  <div className="service-type-description">
                    {route.longName}
                  </div>
                )}
              </div>
            </div>
            <div className="divider invisible" />
            <CallAgencyDisclaimer
              key="on-demand-disclaimer"
              header={intl.formatMessage({ id: 'pay-attention' })}
              text={intl.formatMessage({
                id: 'on-demand-service-route-disclaimer',
              })}
              mobile={mobile}
            />
            <div className="divider invisible" />
          </div>
        </div>,
        container,
      )}
    </>
  );
}

OnDemandInfo.propTypes = {
  routeNumber: PropTypes.node.isRequired,
  pickupBookingInfo: pickupBookingInfoShape.isRequired,
  onClose: PropTypes.func.isRequired,
  route: routeShape.isRequired,
  mobile: PropTypes.bool.isRequired,
};

OnDemandInfo.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default OnDemandInfo;
