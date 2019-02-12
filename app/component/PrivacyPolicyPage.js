import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

const PrivacyPolicyPagePage = ({ currentLanguage }, context) => {
  const policy = context.config.privacyPolicy[currentLanguage];
  return (
    <div className="about-page fullscreen">
      <div className="page-frame fullscreen momentum-scroll">
        {policy.map(
          (section, i) =>
            (section.paragraphs && section.paragraphs.length) ||
            section.link ? (
              <div key={`about-section-${i}`}>
                <h1 className="about-header">{section.header}</h1>
                {section.paragraphs &&
                  section.paragraphs.map((p, j) => (
                    <p key={`about-section-${i}-p-${j}`}>{p}</p>
                  ))}
                {section.link && <Link to={section.link}>{section.link}</Link>}
              </div>
            ) : (
              false
            ),
        )}
        <Link to="/">
          <div className="call-to-action-button">
            <FormattedMessage
              id="back-to-front-page"
              defaultMessage="Back to front page"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

PrivacyPolicyPagePage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

PrivacyPolicyPagePage.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default connectToStores(PrivacyPolicyPagePage, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));
