import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../../../../Icon';

const Contact = ({ contact }) => {
  if (!contact) {
    return null;
  }

  return (
    <div>
      {!!contact.email && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="poi_mail" />
          <span className="text-alignment">{contact.email}</span>
        </div>
      )}
      {!!contact.phone && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="icon-icon_call" />
          <span className="text-alignment">{contact.phone}</span>
        </div>
      )}
      {!!contact.fax && (
        <div className="text-light sidebar-info-container">
          <Icon className="sidebar-info-icon" img="poi_news" />
          <span className="text-alignment">{contact.fax}</span>
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
