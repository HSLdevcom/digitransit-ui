import React from 'react';
import PropTypes from 'prop-types';
import SidebarContainer from './SidebarContainer';
import { getPropertyValueOrDefault } from '../PointFeatureMarker';

const GeoJsonContent = ({ match }) => {
  const { language, lat, lng } = match.location.query;
  const properties = match.location.query;

  const header = getPropertyValueOrDefault(properties, 'name', language);

  const content = getPropertyValueOrDefault(properties, 'content', language);
  // use header as fallback, so address won't be undefined
  const address = getPropertyValueOrDefault(
    properties,
    'address',
    language,
    header,
  );

  const city = getPropertyValueOrDefault(properties, 'city', language);

  let description = null;
  // Only display address field as description if it is a real address + add city if exists.
  if (address !== header && city) {
    description = `${address}, ${city}`;
  } else if (address !== header) {
    description = address;
  } else if (city) {
    description = city;
  }

  const useDescriptionAsHeader = !header;

  return (
    <SidebarContainer
      location={
        lat &&
        lng && {
          address,
          lat: Number(lat),
          lon: Number(lng),
        }
      }
      name={useDescriptionAsHeader ? description : header}
      description={useDescriptionAsHeader ? '' : description}
    >
      {content && <div className="card-text opening-hours">{content}</div>}
    </SidebarContainer>
  );
};

GeoJsonContent.propTypes = {
  match: PropTypes.object,
};

export default GeoJsonContent;
