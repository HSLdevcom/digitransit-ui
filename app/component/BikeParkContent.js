import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape } from 'react-intl';
import BikeParkOrStationHeader from './BikeParkOrStationHeader';
import Icon from './Icon';

const BikeParkContent = ({ bikePark }, { intl }) => {
  const { spacesAvailable, tags } = bikePark;

  const authenticationMethods = tags
    .filter(tag => tag.includes('AUTHENTICATION_METHOD'))
    .map(tag => tag.replace('AUTHENTICATION_METHOD_', '').toLowerCase());

  const pricingMethods = tags
    .filter(tag => tag.includes('PRICING_METHOD'))
    .map(tag => tag.replace('PRICING_METHOD_', '').toLowerCase());

  const services = tags
    .filter(tag => tag.includes('SERVICE'))
    .map(tag => tag.replace('SERVICE_', '').toLowerCase());

  const isFree = pricingMethods.some(method => method.includes('free'));
  const isPaid = pricingMethods.some(method => method.includes('paid'));
  const isOpen24h = pricingMethods.some(method => method.includes('247'));

  return (
    <div className="bike-station-page-container">
      <BikeParkOrStationHeader bikeParkOrStation={bikePark} />
      <div className="bikepark-content-container">
        <Icon img="icon-icon_bikepark" height={2.4} width={2.4} />
        <div className="bikepark-details">
          {isOpen24h && (
            <span>
              {intl.formatMessage({ id: 'is-open' })} &#160;
              <p>{`24${intl.formatMessage({ id: 'hour-short' })}`}</p>
            </span>
          )}
          <span>
            {intl.formatMessage({ id: 'number-of-spaces' })} &#160;
            <p>{spacesAvailable}</p>
          </span>
          <span>
            {isFree && intl.formatMessage({ id: 'free-of-charge' })}
            {isPaid && intl.formatMessage({ id: 'paid' })}
            {authenticationMethods.length > 0 &&
              `, ${intl.formatMessage({
                id: 'access_with',
              })} `}
            {authenticationMethods.map((method, i) => (
              <>
                {intl.formatMessage({ id: method })}
                {i < authenticationMethods.length - 1 && ' | '}
              </>
            ))}
          </span>
          {services.length > 0 && (
            <span>
              {services.map((service, i) => (
                <>
                  {intl.formatMessage({ id: service })}
                  {i < services.length - 1 && ' | '}
                </>
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="citybike-use-disclaimer">
        <div className="disclaimer-header">
          {intl.formatMessage({ id: 'bike-park-disclaimer-header' })}
        </div>
        <div className="disclaimer-content">
          {intl.formatMessage({ id: 'bike-park-disclaimer' })}
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={e => {
            e.stopPropagation();
          }}
          className="external-link"
          href="#"
        >
          {intl.formatMessage({ id: 'bike-park-disclaimer-link' })} &rsaquo;
        </a>
      </div>
    </div>
  );
};

BikeParkContent.propTypes = {
  bikePark: PropTypes.shape({
    bikeParkId: PropTypes.string,
    spacesAvailable: PropTypes.number,
    name: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

BikeParkContent.contextTypes = {
  intl: intlShape.isRequired,
};

const containerComponent = createFragmentContainer(BikeParkContent, {
  bikePark: graphql`
    fragment BikeParkContent_bikePark on BikePark {
      bikeParkId
      spacesAvailable
      name
      lat
      lon
      tags
    }
  `,
});

export { containerComponent as default, BikeParkContent as Component };
