import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { configShape } from '../util/shapes';

const AboutPage = ({ currentLanguage }, { config }) => {
  const [about, setAbout] = useState([]);
  useEffect(() => {
    setAbout(config.aboutThisService[currentLanguage]);
  }, []);
  return (
    <div className="about-page fullscreen">
      <div className="page-frame fullscreen momentum-scroll">
        {about.map((section, i) =>
          (section.paragraphs && section.paragraphs.length) || section.link ? (
            <div key={`about-section-${i}`}>
              <h1 className="about-header">{section.header}</h1>
              {section.paragraphs &&
                section.paragraphs.map((p, j) => (
                  <p
                    key={`about-section-${i}-p-${j}`}
                    // eslint-disable-next-line
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}
              {section.link && (
                <a href={section.link} target="_blank" rel="noreferrer">
                  <FormattedMessage
                    id="journey-planner-manual"
                    defaultMessage="Journey planner manual"
                  />
                </a>
              )}
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

AboutPage.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

AboutPage.contextTypes = {
  config: configShape.isRequired,
};

const connectedComponent = connectToStores(
  AboutPage,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, AboutPage as Component };
