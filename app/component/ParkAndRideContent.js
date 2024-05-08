import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { matchShape, routerShape, RedirectException } from 'found';
import { intlShape } from 'react-intl';
import moment from 'moment-timezone';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { parkShape, configShape, errorShape } from '../util/shapes';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../util/path';
import { isBrowser } from '../util/browser';

function ParkAndRideContent(
  { vehicleParking, error, currentLanguage },
  { config, intl, router, match },
) {
  const [isClient, setClient] = useState(false);
  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  // throw error in client side relay query fails
  if (isClient && error) {
    throw error.message;
  }
  const bikePark = match.location.pathname.includes(PREFIX_BIKEPARK);
  if (!vehicleParking) {
    const path = bikePark ? PREFIX_BIKEPARK : PREFIX_CARPARK;
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

  let spacesAvailable;
  let maxCapacity;
  if (bikePark) {
    spacesAvailable = vehicleParking.availability?.bicycleSpaces;
  } else {
    spacesAvailable = vehicleParking.availability?.carSpaces;
    maxCapacity = vehicleParking.capacity?.carSpaces || 1;
  }

  const {
    getAuthenticationMethods,
    getPricingMethods,
    getServices,
    isFree,
    isPaid,
    getOpeningHours,
  } = config.parkAndRide.pageContent.default;

  useEffect(() => {
    setAuthenticationMethods(getAuthenticationMethods(vehicleParking));
    setPricingMethods(getPricingMethods(vehicleParking));
    setServices(getServices(vehicleParking));
    setOpeningHours(getOpeningHours(vehicleParking));
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
        filteredOpeningHours.length === openingHoursDates.length &&
        filteredOpeningHours.length
      ) {
        const { to, from } = filteredOpeningHours[0].timeSpans;
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
  const { realtime } = vehicleParking;
  const showOpeningHours =
    Array.isArray(openingHours?.dates) && openingHours.dates.length > 0;
  const showSpacesAvailable = !realtime && spacesAvailable;

  return (
    <div className="bike-station-page-container">
      <ParkOrStationHeader
        parkOrStation={vehicleParking}
        parkType={bikePark ? 'bike' : 'car'}
      />
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
          {realtime && (
            <span>
              {intl.formatMessage({ id: 'park-and-ride-availability' })} &#160;
              <p>
                {spacesAvailable} / {maxCapacity}
              </p>
            </span>
          )}
          {showSpacesAvailable && (
            <span>
              {intl.formatMessage({ id: 'number-of-spaces' })} &#160;
              <p>{spacesAvailable}</p>
            </span>
          )}
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
}

ParkAndRideContent.propTypes = {
  vehicleParking: parkShape,
  error: errorShape,
  currentLanguage: PropTypes.string.isRequired,
};

ParkAndRideContent.defaultProps = {
  vehicleParking: undefined,
  error: undefined,
};

ParkAndRideContent.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connectedComponent = connectToStores(
  ParkAndRideContent,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, ParkAndRideContent as Component };
