import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape, RedirectException } from 'found';
import { intlShape } from 'react-intl';
import moment from 'moment-timezone';
import connectToStores from 'fluxible-addons-react/connectToStores';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../util/path';
import { isBrowser } from '../util/browser';

const ParkAndRideContent = (
  { bikePark, carPark, router, match, error, currentLanguage },
  { config, intl },
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
  const [openingHours, setOpeningHours] = useState(null);
  const [lang, setLang] = useState('fi');

  const { spacesAvailable, maxCapacity } = park;
  const {
    getAuthenticationMethods,
    getPricingMethods,
    getServices,
    isFree,
    isPaid,
    getOpeningHours,
  } = config.parkAndRide.pageContent.default;

  useEffect(() => {
    setAuthenticationMethods(getAuthenticationMethods(park));
    setPricingMethods(getPricingMethods(park));
    setServices(getServices(park));
    setOpeningHours(getOpeningHours(park));
  }, []);

  useEffect(() => {
    if (lang !== currentLanguage) {
      setLang(currentLanguage);
    }
  }, [currentLanguage]);

  const getOpeningHoursAsText = () => {
    const openingHoursDates = openingHours?.dates;
    if (openingHoursDates) {
      const filteredOpeningHours = openingHoursDates.filter(o => o.timeSpans);
      const sameOpeningHoursEveryday = filteredOpeningHours.every(
        openingHour =>
          openingHour?.timeSpans.from ===
            filteredOpeningHours[0]?.timeSpans.from &&
          openingHour?.timeSpans.to === filteredOpeningHours[0]?.timeSpans.to,
      );
      if (
        sameOpeningHoursEveryday &&
        filteredOpeningHours.length === openingHoursDates.length
      ) {
        const { to, from } = filteredOpeningHours[0]?.timeSpans;
        if (to - from - 60 * 60 * 24 === 0) {
          return [`24${intl.formatMessage({ id: 'hour-short' })}`];
        }
        const formattedFrom = moment.utc(from * 1000).format('HH:mm');
        const formattedTo = moment.utc(to * 1000).format('HH:mm');
        return [`${formattedFrom} - ${formattedTo}`];
      }
      let i = 0;
      const hoursAsText = [];
      const numberOfDays = filteredOpeningHours.length;
      while (i < numberOfDays) {
        const { date, timeSpans } = filteredOpeningHours[i];
        let j = i + 1;
        while (j < numberOfDays) {
          if (
            filteredOpeningHours[i].timeSpans.from !==
              filteredOpeningHours[j].timeSpans.from ||
            filteredOpeningHours[i].timeSpans.to !==
              filteredOpeningHours[j].timeSpans.to
          ) {
            break;
          }
          j += 1;
        }
        const from = moment.utc(timeSpans.from * 1000).format('HH:mm');
        const to = moment.utc(timeSpans.to * 1000).format('HH:mm');
        const day = date.toLocaleString(currentLanguage, { weekday: 'short' });
        if (i === j - 1) {
          hoursAsText.push(
            `${day.charAt(0).toUpperCase() + day.slice(1)} ${from}-${to}`,
          );
        } else {
          const until = openingHoursDates[j - 1].date.toLocaleString(
            currentLanguage,
            {
              weekday: 'short',
            },
          );
          hoursAsText.push(
            `${day.charAt(0).toUpperCase() + day.slice(1)}-${
              until.charAt(0).toUpperCase() + until.slice(1)
            } ${from}-${to}`,
          );
        }
        i = j;
      }
      return hoursAsText;
    }
    return [];
  };
  const parkIsPaid = isPaid(pricingMethods);
  const parkIsFree = isFree(pricingMethods);
  const realtime = park?.realtime;
  const showOpeningHours =
    Array.isArray(openingHours?.dates) && openingHours.dates.length > 0;
  const showSpacesAvailable = !realtime && spacesAvailable;

  return (
    // TODO refactor class name prefix
    <div className="bike-station-page-container">
      <ParkOrStationHeader parkOrStation={park} />
      <div className="park-content-container">
        <Icon img={`icon-icon_${prePostFix}`} height={2.4} width={2.4} />
        <div className="park-details">
          {showOpeningHours && (
            <div className="park-opening-hours">
              <span>{intl.formatMessage({ id: 'is-open' })} &#160;</span>
              <span>
                {getOpeningHoursAsText().map((text, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <p key={`opening-hour-${text}-${i}`}>{text}</p>
                ))}
              </span>
            </div>
          )}
          {Number.isInteger(maxCapacity) &&
            (showSpacesAvailable ? (
              <span>
                {intl.formatMessage({ id: 'park-and-ride-availability' })}{' '}
                &#160;
                <p>
                  {spacesAvailable} / {maxCapacity}
                </p>
              </span>
            ) : (
              <span>
                {intl.formatMessage({ id: 'number-of-spaces' })} &#160;
                <p>{maxCapacity}</p>
              </span>
            ))}
          {(parkIsFree || parkIsPaid) && (
            <span>
              {parkIsFree && intl.formatMessage({ id: 'free-of-charge' })}
              {parkIsPaid && intl.formatMessage({ id: 'paid' })}
              {authenticationMethods.length > 0 &&
                `, ${intl.formatMessage({
                  id: 'access_with',
                })} `}
              {authenticationMethods.map(
                (method, i) =>
                  `
                ${intl.formatMessage({ id: method })}
                ${i < authenticationMethods.length - 1 ? ' | ' : ''}
              `,
              )}
            </span>
          )}
          {services.length > 0 && (
            <span>
              {services.map(
                (service, i) =>
                  `
                ${intl.formatMessage({ id: service })}
                ${i < services.length - 1 ? ' | ' : ''}
              `,
              )}
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
        {config.parkAndRide.url && (
          <a
            onClick={e => {
              e.stopPropagation();
            }}
            className="external-link"
            href={config.parkAndRide.url[lang]}
            target="_blank"
            rel="noreferrer"
          >
            {intl.formatMessage({ id: `${prePostFix}-disclaimer-link` })}{' '}
            &rsaquo;
          </a>
        )}
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
    maxCapacity: PropTypes.number,
    name: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    realtime: PropTypes.bool,
  }),
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  error: PropTypes.object,
  currentLanguage: PropTypes.string.isRequired,
};

ParkAndRideContent.defaultProps = {
  bikePark: null,
  carPark: null,
};

ParkAndRideContent.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const connectedComponent = connectToStores(
  ParkAndRideContent,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, ParkAndRideContent as Component };
