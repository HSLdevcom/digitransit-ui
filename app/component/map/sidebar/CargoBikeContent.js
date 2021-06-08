/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { intlShape } from 'react-intl';
import ComponentUsageExample from '../../ComponentUsageExample';
import Loading from '../../Loading';
import withBreakpoint from '../../../util/withBreakpoint';
import SidebarContainer from './SidebarContainer';
import Icon from '../../Icon';

const CargoBikeContent = (slug, { intl }) => {
  const CARGO_BIKE_DETAILS_API = `https://backend.openbikebox.next-site.de/api/v1/location?slug=${slug}&format=object`;
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetails({});
    fetch(`${CARGO_BIKE_DETAILS_API}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setDetails(data);
      });
  }, [slug]);

  return !loading ? (
    <SidebarContainer
      location={{
        address: details.address,
        lat: Number(details.lat),
        lon: Number(details.lon),
      }}
      name={details.name}
      icon=""
    >
      <div className="content">
        <div className="text-light">
          <Icon className="charging-station-icon" img="icon-icon_schedule" />
          <span className="text-alignment">{24 / 7}</span>
        </div>
        <div className="charging-station-divider" />
        <div className="charging-info-container">
          <div className="text-light text-alignment">|</div>
          <div className="text-light text-alignment">{2}</div>
        </div>
        <div className="charging-station-divider" />
        <div className="text-light">
          <Icon className="charging-station-icon" img="icon-icon_payment" />
          <span className="text-alignment">RFID</span>
        </div>
        <div className="text-light">
          <Icon className="charging-station-icon" img="icon-icon_place" />
          <span className="text-alignment">ladiada</span>
        </div>
        <div className="text-light">
          <Icon className="charging-station-icon" img="icon-icon_call" />
          <span className="text-alignment">{12312313}</span>
        </div>
        <div className="charging-station-divider" />
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
