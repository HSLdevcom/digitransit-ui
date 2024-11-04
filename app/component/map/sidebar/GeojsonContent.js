import React from 'react';
import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import SidebarContainer from './SidebarContainer';
import SelectedFeatureStore from '../../../store/SelectedFeatureStore';

const getPropertyValueOrDefault = (
  properties,
  propertyName,
  language,
  defaultValue = undefined,
) =>
  (properties &&
    propertyName &&
    ((language && properties[`${propertyName}_${language}`]) ||
      properties[propertyName])) ||
  defaultValue;

const GeoJsonContent = ({ match, selectedFeature }) => {
  const { language, lat, lng } = match.location.query;

  const geojsonContent = selectedFeature?.properties?.popupContent;

  const properties = selectedFeature?.properties || match.location.query;

  const header = getPropertyValueOrDefault(properties, 'name', language);

  const unsafeContent = getPropertyValueOrDefault(
    properties,
    'content',
    language,
  );
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
      {geojsonContent ? (
        <div
          className="card-text opening-hours"
          dangerouslySetInnerHTML={{ __html: geojsonContent }}
        />
      ) : (
        unsafeContent && (
          <div className="card-text opening-hours">{unsafeContent}</div>
        )
      )}
    </SidebarContainer>
  );
};

GeoJsonContent.propTypes = {
  match: PropTypes.object,
  selectedFeature: PropTypes.object,
};

GeoJsonContent.contextTypes = {
  getStore: PropTypes.func.isRequired,
};

const connectedComponent = connectToStores(
  GeoJsonContent,
  [SelectedFeatureStore],
  ({ getStore }) => ({
    selectedFeature: getStore(SelectedFeatureStore).getSelectedFeature(),
  }),
);

export { connectedComponent as default, GeoJsonContent as Component };
