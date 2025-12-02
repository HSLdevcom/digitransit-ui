import { FormattedMessage, intlShape } from 'react-intl';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useDeepLink } from '../../util/vehicleRentalUtils';
import Icon from '../Icon';
import ExternalLink from '../ExternalLink';

export default function TaxiLinkContainer({
  operatorName,
  infoUrl,
  bookingUrl,
  icon,
}) {
  const operatorAppText = (
    <FormattedMessage
      id="open-operator-app"
      values={{
        operator: operatorName,
      }}
      defaultMessage="Open the app to use a taxi"
    />
  );

  const url = bookingUrl.startsWith('http') ? bookingUrl : infoUrl;
  const onClick = url.startsWith('http')
    ? () => {}
    : () => useDeepLink(url, infoUrl);

  return (
    <div>
      <div className="itinerary-transit-leg-route-with-link">
        <div className="itinerary-with-link">
          <div className="taxi-icon">
            <Icon img={icon} viewBox="0 0 32 32" />
          </div>
          <div className="itinerary-with-link-text-container">
            <span className={cx('headsign', 'scooter-headsign')}>
              <ExternalLink
                className="rental-vehicle-link"
                href={url}
                onClick={onClick}
              >
                {operatorAppText}
              </ExternalLink>
            </span>
          </div>
        </div>
        <div className="link-to-e-scooter-operator">
          <ExternalLink
            className="rental-vehicle-link"
            href={url}
            onClick={onClick}
          >
            <Icon img="icon_external-link-box" height={1} width={1} />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}

TaxiLinkContainer.propTypes = {
  operatorName: PropTypes.string.isRequired,
  infoUrl: PropTypes.string,
  bookingUrl: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
};

TaxiLinkContainer.contextTypes = {
  intl: intlShape.isRequired,
};

TaxiLinkContainer.defaultProps = {
  infoUrl: undefined,
};
