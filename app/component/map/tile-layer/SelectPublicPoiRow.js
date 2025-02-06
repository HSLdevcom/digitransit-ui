import React from 'react';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import pickBy from 'lodash/pickBy';
import { getLayerByCode } from '../../../util/mapLayerUtils';
import Icon from '../../Icon';

export default function SelectPublicPoi(props, { config, intl }) {
  const { properties, latitude, longitude } = props;

  const { category3: code, name, osm_id: osmId } = properties;

  const layer = getLayerByCode(code, config);

  const svg = layer?.properties?.icon?.svg;

  const params = pickBy(
    {
      lat: latitude,
      lng: longitude,
      name: name || layer.translations[intl.locale],
      osmId,
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
