import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import SidebarContainer from './SidebarContainer';
import Icon from '../../Icon';
import OSMOpeningHours from '../popups/OSMOpeningHours';
import { getLayerByCode } from '../../../util/mapLayerUtils';

const PublicPoiContent = ({ match }, { intl, config }) => {
  const { osmId, lat, lng } = match.location.query;

  const [code] = match.location.pathname.split('/').reverse();

  const layer = getLayerByCode(code, config);

  const [featureProperties, setFeatureProperties] = useState(null);

  useEffect(() => {
    fetch(
      `${config.featuresUrl}/collections/public.pois/items.json?osm_id=${osmId}&category3=${code}`,
    )
      .then(response => response.json())
      .then(({ features }) => {
        if (features.length) {
          setFeatureProperties(features[0].properties);
        }
      });
  }, [osmId, code]);

  if (!layer || !featureProperties) {
    return null;
  }

  const {
    name,
    address,
    opening_hours: openingHours,
    phone,
    website,
    wheelchair,
    dog,
    outdoor_seating: outdoorSeating,
    internet_access: internetAccess,
    operator,
    brand,
  } = featureProperties;

  const latitude = Number(lat);
  const longitude = Number(lng);

  const accessibilityMessage =
    wheelchair === 'yes'
      ? {
          message: <FormattedMessage id="poi-tag-wheelchair" />,
          key: 'wheelchair',
        }
      : null;
  const outdoorSeatingMessage =
    outdoorSeating === 'yes'
      ? {
          message: <FormattedMessage id="poi-tag-outdoor-seating" />,
          key: 'outdoor_seating',
        }
      : null;
  const dogsAllowedMessage =
    dog === 'yes'
      ? {
          message: <FormattedMessage id="poi-tag-dogs-allowed" />,
          key: 'dogs-allowed',
        }
      : null;
  const internetAccessMessage =
    internetAccess === 'wlan'
      ? { message: <FormattedMessage id="poi-tag-wifi" />, key: 'wifi' }
      : null;
  const operatorMessage = operator
    ? {
        message: (
          <FormattedMessage id="poi-tag-operator" values={{ operator }} />
        ),
        key: 'operator',
      }
    : null;
  const brandMessage = brand
    ? {
        message: <FormattedMessage id="poi-tag-brand" values={{ brand }} />,
        key: 'brand',
      }
    : null;

  const svg = layer?.properties?.icon?.svg;

  return (
    <SidebarContainer
      name={layer.translations[intl.locale] || layer.translations.en}
      description={name}
      dataURI={svg ? `data:image/svg+xml;base64,${btoa(svg)}` : undefined}
      location={{ lat: latitude, lon: longitude, address: address || name }}
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
            accessibilityMessage,
            outdoorSeatingMessage,
            dogsAllowedMessage,
            internetAccessMessage,
            operatorMessage,
            brandMessage,
          ]
            .filter(Boolean)
            .map(({ message, key }, index) => (
              <>
                {index === 0 && <div className="divider" />}
                <div key={key} className="text-light sidebar-info-container">
                  <span className="text-alignment">{message}</span>
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
