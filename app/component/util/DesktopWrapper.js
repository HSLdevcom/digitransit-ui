import React from 'react';
import dimensions from 'react-dimensions';
import config from '../../config';

function DesktopWrapper({ children, containerWidth }) {
  if (containerWidth < 980
    || !config.enableDesktopWrapper
    || (typeof window !== 'undefined' && window.location.pathname === '/styleguide')
  ) {
    return children;
  }
  return (
    <div className="fullscreen desktop-wrapper">
      <div className="desktop-wrapper--content">
        <div
          className="desktop-wrapper--left-bar"
          dangerouslySetInnerHTML={{ __html: config.desktopWrapperText }}
        >
        </div>
        <div className="desktop-wrapper--child-content">
          <svg viewBox="0 0 500 1000" className="desktop-wrapper--phone">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              fill="#222"
              d="M11 137h3v39h-3v-39zm0 84h3v72h-3v-72zm475 0h3v72h-3v-72zM11 311h3v72h-3v-72zM431
                13.8H69c-30.3 0-55 24.6-55 55v862.4c0 30.4 24.7 55 55 55h362c30.3 0 55-24.6
                55-55V68.8c0-30.4-24.7-55-55-55zM458 872H42V154h416v718z"
            />
            <path
              d="M249.4 963.2c-21 0-37.8-17-37.8-37.8s17-37.7 37.8-37.7c20.8 0 37.7 17 37.7
                37.7s-16.6 37.8-37.4 37.8zm0-71.5c-18.7 0-33.8 15-33.8 33.7s15 33.8 33.8 33.8c18.6 0
                33.7-15.2 33.7-33.8s-15-33.7-33.4-33.7z"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M174.6 68.7c4.3 0 7.8 3.5 7.8 7.8s-3.5 7.8-7.8 7.8-7.8-3.5-7.8-7.8 3.5-7.8
                7.8-7.8zm75.4-30c3.2 0 6 2.7 6 6 0 3-2.8 5.8-6 5.8s-5.8-2.6-5.8-5.8c0-3.3 2.6-6
                5.8-6zm-34 34h68c1.7 0 3 1.3 3 3v1.7c0 1.7-1.3 3-3 3h-68c-1.7 0-3-1.3-3-3v-1.8c0-1.6
                 1.3-3 3-3zM457 130H43c-1.7 0-3 1.3-3 3v738c0 1.6 1.3 3 3 3h414c1.7 0 3-1.4
                 3-3V133c0-1.7-1.3-3-3-3zm1 742H42V154h416v718z"
            />
          </svg>
          <div className="fullscreen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

DesktopWrapper.propTypes = {
  children: React.PropTypes.node.isRequired,
  containerWidth: React.PropTypes.number.isRequired,
};

export default dimensions()(DesktopWrapper);
