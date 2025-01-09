import React from 'react';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import pickBy from 'lodash/pickBy';
import { getLayerByCode } from '../../../util/mapLayerUtils';
import Icon from '../../Icon';

export default function SelectPublicPoi(props, { config, intl }) {
  const { properties, latitude, longitude } = props;

  const { category3: code, name, address, website, phone } = properties;

  const layer = getLayerByCode(code, config);

  const svg = layer?.properties?.icon?.svg;

  const detailsProperties = { ...properties };

  // Filter out properties that are not in the layer's attributes
  Object.keys(detailsProperties).forEach(key => {
    if (!layer?.properties?.attributes?.includes(key)) {
      delete detailsProperties[key];
    }
  });

  const params = pickBy(
    {
      ...detailsProperties,
      lat: latitude,
      lng: longitude,
      code,
      name: name || layer.translations[intl.locale],
      address,
      website,
      phone,
    },
    value => value !== undefined,
  );

  return (
    <Link
      className="stop-popup-choose-row"
      to={`/pois/${code}?${new URLSearchParams(params).toString()}`}
    >
      <div className="padding-vertical-normal select-row-icon">
        {svg && <Icon dataURI={`data:image/svg+xml;base64,${btoa(svg)}`} />}
      </div>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">
          {name || layer.translations[intl.locale]}
        </h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
      <hr className="no-margin gray" />
    </Link>
  );
}

SelectPublicPoi.propTypes = {
  properties: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
};

SelectPublicPoi.contextTypes = {
  intl: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};
