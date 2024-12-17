import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import SidebarContainer from './SidebarContainer';
import { getLayerByCode } from '../../../util/mapLayerUtils';

const PublicPoiContent = ({ match }, { intl, config }) => {
  const { code, name } = match.location.query;

  const layer = getLayerByCode(code, config);
  const svg = layer?.properties?.icon?.svg;

  return (
    <SidebarContainer
      name={layer.translations[intl.locale] || layer.translations.en}
      description={name}
      dataURI={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : undefined}
    />
  );
};

PublicPoiContent.displayName = 'PublicPoiContent';

PublicPoiContent.propTypes = {
  match: PropTypes.object.isRequired,
};

PublicPoiContent.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default PublicPoiContent;
