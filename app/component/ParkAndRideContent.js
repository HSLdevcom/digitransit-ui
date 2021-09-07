import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape, RedirectException } from 'found';
import { intlShape } from 'react-intl';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../util/path';
import { isBrowser } from '../util/browser';

const ParkAndRideContent = (
  { bikePark, carPark, router, match, error },
  { intl },
) => {
  const park = bikePark || carPark;

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  // throw error in client side relay query fails
  if (isClient && error) {
    throw error.message;
  }

  if (!park && !error) {
    const path = match.location.pathname.includes(PREFIX_BIKEPARK)
      ? PREFIX_BIKEPARK
      : PREFIX_CARPARK;
    if (isBrowser) {
      router.replace(`/${path}`);
    } else {
      throw new RedirectException(`/${path}`);
    }
    return null;
  }

  const prePostFix = bikePark ? 'bike-park' : 'car-park';
  const [authenticationMethods, setAuthenticationMethods] = useState([]);
  const [pricingMethods, setPricingMethods] = useState([]);
  const [services, setServices] = useState([]);
  const { spacesAvailable, tags } = park;

  useEffect(() => {
    if (Array.isArray(tags)) {
      setAuthenticationMethods(
        tags
          .filter(tag => tag.includes('AUTHENTICATION_METHOD'))
          .map(tag => tag.replace('AUTHENTICATION_METHOD_', '').toLowerCase()),
      );

      setPricingMethods(
        tags
          .filter(tag => tag.includes('PRICING_METHOD'))
          .map(tag => tag.replace('PRICING_METHOD_', '').toLowerCase()),
      );

      setServices(
        tags
          .filter(tag => tag.includes('SERVICE'))
          .map(tag => tag.replace('SERVICE_', '').toLowerCase()),
      );
    }
  }, []);

  const isFree = pricingMethods.some(method => method.includes('free'));
  const isPaid = pricingMethods.some(method => method.includes('paid'));
  const isOpen24h = pricingMethods.some(method => method.includes('247'));

  return (
    <div className="bike-station-page-container">
      <ParkOrStationHeader parkOrStation={park} />
      <div className="park-content-container">
        <Icon img={`icon-icon_${prePostFix}`} height={2.4} width={2.4} />
        <div className="park-details">
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
        <h2 className="disclaimer-header">
          {intl.formatMessage({ id: `${prePostFix}-disclaimer-header` })}
        </h2>
        <div className="disclaimer-content">
          {intl.formatMessage({ id: `${prePostFix}-disclaimer` })}
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={e => {
            e.stopPropagation();
          }}
          className="external-link"
          href="#"
        >
          {intl.formatMessage({ id: `${prePostFix}-disclaimer-link` })} &rsaquo;
        </a>
      </div>
    </div>
  );
};

ParkAndRideContent.propTypes = {
  bikePark: PropTypes.shape({
    bikeParkId: PropTypes.string,
    spacesAvailable: PropTypes.number,
    name: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  carPark: PropTypes.shape({
    carParkId: PropTypes.string,
    spacesAvailable: PropTypes.number,
    name: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  error: PropTypes.object,
};

ParkAndRideContent.defaultProps = {
  bikePark: null,
  carPark: null,
};

ParkAndRideContent.contextTypes = {
  intl: intlShape.isRequired,
};

export default ParkAndRideContent;
