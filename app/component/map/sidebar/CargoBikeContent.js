/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { intlShape } from 'react-intl';
import ComponentUsageExample from '../../ComponentUsageExample';
import Loading from '../../Loading';
import withBreakpoint from '../../../util/withBreakpoint';
import SidebarContainer from './SidebarContainer';
import Icon from '../../Icon';

const CargoBikeContent = ({ slug }, { intl }) => {
  const CARGO_BIKE_DETAILS_API = `https://backend.openbikebox.next-site.de/api/v1/location?slug=${slug}&format=object`;
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const description = intl.formatMessage({
    id: 'cargo-bike-content-description',
    defaultMessage: 'Cargo bike station',
  });

  useEffect(() => {
    setLoading(true);
    setDetails({});
    fetch(`${CARGO_BIKE_DETAILS_API}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setDetails(data.data);
      });
  }, [slug]);

  const getOpeningTimes = () => {
    const openingTimes = details?.twentyfourseven;
    return (
      openingTimes && (
        <div>
          {intl.formatMessage({
            id: 'open-24-7',
            defaultMessage: 'Open 24/7',
          })}
        </div>
      )
    );
  };

  const getAddress = () => {
    const { address, locality, postalcode } = details;

    return (
      address &&
      locality &&
      postalcode && <div>{`${address}, ${postalcode}, ${locality}`}</div>
    );
  };

  const getBookingLink = () => {
    const { booking_url } = details;
    return (
      booking_url && (
        <div className="booking-link">
          <Icon className="sidebar-info-icon" img="icon-icon_booking" />
          <span className="text-alignment">
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={booking_url} target="_blank">
              {intl.formatMessage({
                id: 'cargo-bike-booking-link',
                defaultMessage: 'Book now',
              })}
            </a>
          </span>
        </div>
      )
    );
  };

  const getCapacity = () => {
    const { resource } = details;
    const body = {
      id: 'cargo-bikes-capacity-no-data',
      defaultMessage: 'No capacity data available',
    };
    const capacity = resource?.length;
    const available = resource?.filter(res => res.status === 'free')?.length;

    if (capacity) {
      if (available && available > 0) {
        body.id = 'cargo-bikes-capacity-available';
        body.defaultMessage = '{available} of {capacity} available';
      } else {
        body.id = 'cargo-bikes-capacity-in-total';
        body.defaultMessage = 'Capacity: {capacity} cargo bike/ cargo bikes';
      }
    }

    return (
      <>
        <div className="text-light text-alignment">|</div>
        <div className="text-light text-alignment">
          {intl.formatMessage(body, { capacity, available })}
        </div>
      </>
    );
  };

  return !loading ? (
    <SidebarContainer
      name={details.name}
      description={description}
      icon="icon-icon_cargo_bike_sharing"
      photoUrl={details?.photo?.url}
    >
      <div className="content">
        <div className="text-light opening-times-container">
          <Icon className="sidebar-info-icon" img="icon-icon_schedule" />
          <span className="text-alignment">{getOpeningTimes()}</span>
        </div>
        <div className="divider" />
        <div className="sidebar-info-container">
          <Icon
            className="sidebar-info-icon"
            img="icon-icon_cargo_bike_sharing"
          />
          <div className="text-light text-alignment">
            {intl.formatMessage({
              id: 'cargo-bike',
              defaultMessage: 'Cargo bike',
            })}
          </div>
          {getCapacity()}
        </div>
        <div className="divider" />
        <div className="text-light">
          <Icon className="sidebar-info-icon" img="icon-icon_place" />
          <span className="text-alignment">{getAddress()}</span>
        </div>
        <div className="divider" />
        {getBookingLink()}
      </div>
    </SidebarContainer>
  ) : (
    <SidebarContainer>
      <div className="padding-normal charging-station-popup">
        <div className="content">
          <Loading />
        </div>
      </div>
    </SidebarContainer>
  );
};

CargoBikeContent.propTypes = {
  slug: PropTypes.string.isRequired,
};

CargoBikeContent.description = (
  <div>
    <p>Renders a citybike popup.</p>
    <ComponentUsageExample description="">
      <CargoBikeContent slug="cargo-bike-slug">
        Im content of a cargo bike card
      </CargoBikeContent>
    </ComponentUsageExample>
  </div>
);

CargoBikeContent.contextTypes = {
  intl: intlShape.isRequired,
};

export default withBreakpoint(CargoBikeContent);
