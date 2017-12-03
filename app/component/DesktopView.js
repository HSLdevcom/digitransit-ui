import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import ErrorBoundary from './ErrorBoundary';

export default function DesktopView(
  { title, header, map, content, homeUrl },
  { intl: { formatMessage } },
) {
  return (
    <div className="desktop">
      <div className="main-content">
        <div className="desktop-title">
          <h2>
            <Link
              title={formatMessage({
                id: 'back-to-front-page',
                defaultMessage: 'Back to the front page',
              })}
              to={homeUrl}
            >
              <Icon img="icon-icon_home" className="home-icon" />
            </Link>
            <Icon
              img="icon-icon_arrow-collapse--right"
              className="arrow-icon"
            />
            {title}
          </h2>
        </div>
        {header}
        <ErrorBoundary>{content}</ErrorBoundary>
      </div>
      <div className="map-content">
        <ErrorBoundary>{map}</ErrorBoundary>
      </div>
    </div>
  );
}

DesktopView.propTypes = {
  title: PropTypes.node,
  header: PropTypes.node,
  map: PropTypes.node,
  content: PropTypes.node,
  homeUrl: PropTypes.string,
};

DesktopView.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};
