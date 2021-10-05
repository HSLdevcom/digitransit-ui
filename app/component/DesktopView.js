import PropTypes from 'prop-types';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import BackButton from './BackButton'; // DT-3358
import ScrollableWrapper from './ScrollableWrapper';

export default function DesktopView({
  title,
  header,
  map,
  content,
  settingsDrawer,
  carpoolDrawer,
  scrollable,
  bckBtnVisible,
  bckBtnFallback,
}) {
  return (
    <div className="desktop">
      <div className="main-content" role="main">
        {bckBtnVisible && (
          <div className="desktop-title">
            <div className="title-container h2">
              <BackButton
                title={title}
                icon="icon-icon_arrow-collapse--left"
                iconClassName="arrow-icon"
                fallback={bckBtnFallback}
              />
            </div>
          </div>
        )}
        <ScrollableWrapper scrollable={scrollable}>
          {header}
          <ErrorBoundary>{content}</ErrorBoundary>
        </ScrollableWrapper>
      </div>
      <div className="map-content">
        {settingsDrawer}
        {carpoolDrawer}
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
  settingsDrawer: PropTypes.node,
  carpoolDrawer: PropTypes.node,
  scrollable: PropTypes.bool,
  bckBtnVisible: PropTypes.bool,
  bckBtnFallback: PropTypes.string,
};

DesktopView.defaultProps = {
  scrollable: false,
  bckBtnVisible: true,
  bckBtnFallback: undefined,
};
