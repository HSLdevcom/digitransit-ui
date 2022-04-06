import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../../../../Icon';

const Contact = ({ contact }) => {
  if (!contact) {
    return null;
  }

  const webUrl = (contact.webUrls || []).find(
    _webUrl => _webUrl.description === 'url',
  );
  const { url } = webUrl || {};

  return (
    <div>
      {!!url && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="poi_link" />
          <a
            href={url}
            className="text-alignment"
            target="_blank"
            rel="noreferrer noopener"
          >
            {url}
          </a>
        </div>
      )}
      {!!contact.email && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="poi_mail" />
          <a href={`mailto:${contact.email}`} className="text-alignment">
            {contact.email}
          </a>
        </div>
      )}
      {!!contact.phone && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="icon-icon_call" />
          <a href={`tel:${contact.phone}`} className="text-alignment">
            {contact.phone}
          </a>
        </div>
      )}
      <div className="divider" />
    </div>
  );
};

Contact.propTypes = {
  contact: PropTypes.object.isRequired,
};

export default Contact;
