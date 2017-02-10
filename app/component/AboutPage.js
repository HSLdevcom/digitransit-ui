import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

const AboutPage = ({ currentLanguage }, context) => {
  const about = context.config.aboutThisService[currentLanguage];
  return (
    <div className="about-page fullscreen">
      <div className="page-frame fullscreen momentum-scroll">
        <h1 id="about-header">
          <FormattedMessage
            id="about-this-service" defaultMessage="About the service"
          />
        </h1>
        <p>{about.about}</p>

        <h1>
          <FormattedMessage
            id="digitransit-platform" defaultMessage="Digitransit service platform"
          />
        </h1>
        <p>{about.digitransit}</p>

        <h1>
          <FormattedMessage
            id="datasources" defaultMessage="Data sources"
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

AboutPage.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

export default connectToStores(AboutPage, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));
