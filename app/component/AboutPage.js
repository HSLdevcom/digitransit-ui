import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Config from '../config';

const AboutPage = ({ currentLanguage }) => {
  const about = Config.aboutThisService[currentLanguage];
  return (
    <div className="about-page">
      <div className="page-frame fullscreen momentum-scroll">
        <h1 id="about-header">
          <FormattedMessage
            id="about-this-service" defaultMessage="About this service"
          />
        </h1>
        <p>{about.about}</p>

        <h1>
          <FormattedMessage
            id="digitransit-platform" defaultMessage="Digitransit platform"
          />
        </h1>
        <p>{about.digitransit}</p>

        <h1>
          <FormattedMessage
            id="datasources" defaultMessage="Datasources"
          />
        </h1>
        <p>{about.datasources}</p>

        <Link to="/">
          <div className="call-to-action-button">
            <FormattedMessage
              id="back-to-front-page" defaultMessage="Back to front page"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

AboutPage.propTypes = {
  currentLanguage: React.PropTypes.string.isRequired,
};

export default connectToStores(AboutPage, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));
