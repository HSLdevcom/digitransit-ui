import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import ErrorBoundary from './ErrorBoundary';

export default function DesktopView(
  { title, header, map, content, homeUrl, scrollable },
  { intl: { formatMessage } },
) {
  return (
    <div className="desktop">
      <div className="main-content">
        <div className="desktop-title">
          <div className="title-container h2">
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
            <h1 className="h2">{title}</h1>
          </div>
        </div>
        <div
          className={cx('scrollable-content-wrapper', {
            'momentum-scroll': scrollable,
          })}
        >
          {header}
          <ErrorBoundary>{content}</ErrorBoundary>
        </div>
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
  scrollable: PropTypes.bool,
};

DesktopView.defaultProps = {
  scrollable: false,
};

DesktopView.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};
