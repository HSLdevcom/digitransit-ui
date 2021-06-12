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

  return !loading ? (
    <SidebarContainer
      name={details.name}
      description={description}
      icon="icon-icon_cargo_bike_sharing"
      photoUrl={details?.photo?.url}
    >
      <div className="content">
        <div className="text-light opening-times-container">
          <Icon className="cargo-bike-content-icon" img="icon-icon_schedule" />
          <span className="text-alignment">{getOpeningTimes()}</span>
        </div>
        <div className="divider" />
        <div className="charging-info-container">
          <Icon
            className="cargo-bike-content-icon"
            img="icon-icon_cargo_bike"
          />
          <div className="text-light text-alignment">|</div>
          <div className="text-light text-alignment">{2}</div>
        </div>
        <div className="divider" />
        <div className="text-light">
          <Icon className="cargo-bike-content-icon" img="icon-icon_payment" />
          <span className="text-alignment">RFID</span>
        </div>
        <div className="text-light">
          <Icon className="cargo-bike-content-icon" img="icon-icon_place" />
          <span className="text-alignment">ladiada</span>
        </div>
        <div className="text-light">
          <Icon className="cargo-bike-content-icon" img="icon-icon_call" />
          <span className="text-alignment">{12312313}</span>
        </div>
        <div className="divider" />
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
