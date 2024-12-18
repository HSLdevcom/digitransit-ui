import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import SidebarContainer from './SidebarContainer';
import Icon from '../../Icon';
import OSMOpeningHours from '../popups/OSMOpeningHours';
import { getLayerByCode } from '../../../util/mapLayerUtils';

const PublicPoiContent = ({ match }, { intl, config }) => {
  const {
    lat,
    lng: lon,
    code,
    name,
    address,
    openingHours,
    phone,
    website,
    wheelchair,
    dog,
    outdoorSeating,
    internetAccess,
  } = match.location.query;

  const layer = getLayerByCode(code, config);

  if (!layer) {
    return null;
  }

  const accessibilityMessageId =
    wheelchair === 'yes' ? 'poi-tag-wheelchair' : null;
  const outdoorSeatingMessageId =
    outdoorSeating === 'yes' ? 'poi-tag-outdoor-seating' : null;
  const dogsAllowedMessageId = dog === 'yes' ? 'poi-tag-dogs-allowed' : null;
  const internetAccessMessageId =
    internetAccess === 'wlan' ? 'poi-tag-wifi' : null;

  const svg = layer?.properties?.icon?.svg;

  return (
    <SidebarContainer
      name={layer.translations[intl.locale] || layer.translations.en}
      description={name}
      dataURI={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : undefined}
      location={{ lat, lon, address, name }}
    >
      <div className="content">
        {(address || phone || website) && <div className="divider" />}
        {address && (
          <div className="text-light sidebar-info-container">
            <Icon className="sidebar-info-icon" img="icon-icon_place" />
            <span className="text-alignment">{address}</span>
            <br />
            <br />
          </div>
        )}
        {phone && (
          <div className="text-light sidebar-info-container">
            <Icon className="sidebar-info-icon" img="icon-icon_phone" />
            <span className="text-alignment">
              <a href={`tel:${phone}`}>{phone}</a>
            </span>
            <br />
            <br />
          </div>
        )}
        {website && (
          <div className="text-light sidebar-info-container">
            <Icon className="sidebar-info-icon" img="icon-icon_website" />
            <span className="text-alignment">
              <a target="_blank" rel="noopener noreferrer" href={website}>
                {website}
              </a>
            </span>
            <br />
            <br />
          </div>
        )}
        {openingHours && (
          <>
            <div className="divider" />
            <div className="text-light sidebar-info-container">
              <OSMOpeningHours openingHours={openingHours} displayStatus />
            </div>
          </>
        )}
        <>
          {[
            accessibilityMessageId,
            outdoorSeatingMessageId,
            dogsAllowedMessageId,
            internetAccessMessageId,
          ]
            .filter(Boolean)
            .map((messageId, index) => (
              <>
                {index === 0 && <div className="divider" />}
                <div
                  key={messageId}
                  className="text-light sidebar-info-container"
                >
                  <span className="text-alignment">
                    <FormattedMessage id={messageId} />
                  </span>
                </div>
              </>
            ))}
          <br />
        </>
      </div>
    </SidebarContainer>
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
