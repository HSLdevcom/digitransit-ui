/* eslint-disable react/no-array-index-key */
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../configurations/ConfigContext';

export default function AboutPage() {
  const config = useConfigContext();
  const about = config.aboutThisService[config.language];

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
}
