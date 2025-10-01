import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { FormattedMessage, intlShape } from 'react-intl';
import {
  configShape,
  agencyShape,
  pickupBookingInfoShape,
  routeShape,
} from '../../util/shapes';
import Icon from '../Icon';

function OnDemandInfo(
  { routeNumber, route, pickupBookingInfo, agency, mobile, onClose },
  context,
) {
  const container = mobile
    ? document.getElementById('content-container')
    : document.getElementById('main-content');
  return ReactDOM.createPortal(
    <div
      className={`main-content on-demand-info-container ${
        mobile ? 'mobile' : ''
      }`}
    >
      <div className="route-header ">
        <div className={`back-button ${mobile ? 'mobile' : ''}`}>
          <button
            type="button"
            className="icon-holder noborder cursor-pointer"
            onClick={onClose}
            aria-label={context.intl.formatMessage({
              id: 'back-button-title',
              defaultMessage: 'Go back to previous page',
            })}
            tabIndex={0}
          >
            <Icon
              img="icon_arrow-collapse--left"
              color={context.config.colors.primary}
              className="arrow-icon cursor-pointer"
            />
          </button>
        </div>
        {routeNumber}
      </div>
      <div className="divider top" />
      <div className="ticket-information">
        <div className="on-demand-info-headline">
          <FormattedMessage
            id="ticket-information"
            defaultMessage="Ticket information"
          />
        </div>
        <div className="on-demand-info-content">
          <FormattedMessage
            id="separate-ticket-required-disclaimer"
            defaultMessage="Please contact the service provider for ticket information."
            values={{
              agencyName: agency?.name,
            }}
          />
        </div>
      </div>
      <div className="divider" />
      <div className="on-demand-service">
        <div className="on-demand-info-headline">
          <FormattedMessage
            id="on-demand-service-type"
            defaultMessage="On-demand service type"
          />
        </div>
        <div className="on-demand-info-content">
          <FormattedMessage
            id="on-demand-service"
            defaultMessage="On-demand service"
          />
        </div>
        <div className="on-demand-info-content">
          {route.longName && (
            <div className="service-type-description">{route.longName}</div>
          )}
        </div>
      </div>
      <div className="divider" />
      <div className="agency">
        <div className="on-demand-info-headline">
          {context.intl.formatMessage({ id: 'agency' })}
        </div>
        <div className="on-demand-info-content">{agency?.name}</div>
      </div>
      <div className="instructions">
        <div className="divider" />
        <div className="on-demand-info-headline">
          <FormattedMessage
            id="on-demand-service-instructions"
            defaultMessage="Instructions"
          />
        </div>
        <div className="on-demand-info-content">
          {pickupBookingInfo?.message}
        </div>
        {pickupBookingInfo?.contactInfo?.phoneNumber && (
          <div className="on-demand-info-content">
            <div className="phone-section">
              <Icon className="phone-icon" img="icon_phone" />
              <span className="phone-number">
                {pickupBookingInfo?.contactInfo?.phoneNumber}
              </span>
            </div>
          </div>
        )}
      </div>
      {pickupBookingInfo?.contactInfo?.infoUrl && (
        <>
          <div className="divider" />
          <div className="on-demand-info-headline">
            <FormattedMessage
              id="extra-info"
              defaultMessage="More information:"
            />
          </div>
          <div className="on-demand-info-content">
            <a
              href={pickupBookingInfo?.contactInfo?.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {pickupBookingInfo?.contactInfo?.infoUrl}
            </a>
          </div>
        </>
      )}
      <div className="divider invisible" />
    </div>,
    container,
  );
}

OnDemandInfo.propTypes = {
  routeNumber: PropTypes.node,
  pickupBookingInfo: pickupBookingInfoShape,
  onClose: PropTypes.func.isRequired,
  agency: agencyShape,
  route: routeShape.isRequired,
  mobile: PropTypes.bool.isRequired,
};

OnDemandInfo.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

export default OnDemandInfo;
