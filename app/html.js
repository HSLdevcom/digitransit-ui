import PropTypes from 'prop-types';
import React from 'react';

const Application = ({
  fonts,
  svgSprite,
  css,
  content,
  polyfill,
  state,
  locale,
  scripts,
  relayData,
  head,
}) => (
  <html lang={locale}>
    <head>
      {head !== null ? head.title.toComponent() : false}
      {head !== null ? head.meta.toComponent() : false}
      {head !== null ? head.link.toComponent() : false}
      <link rel="stylesheet" type="text/css" href={fonts} />
      {css}
    </head>
    <body>
      <script dangerouslySetInnerHTML={{ __html: polyfill }} />
      {svgSprite}
      <div id="app" dangerouslySetInnerHTML={{ __html: content }} />
      <script dangerouslySetInnerHTML={{ __html: state }} />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(relayData) }}
        type="application/json"
        id="relayData"
      />
      {scripts}
      <noscript>This page requires JavaScript to run.</noscript>
    </body>
  </html>
);

Application.propTypes = {
  fonts: PropTypes.string,
  svgSprite: PropTypes.node,
  css: PropTypes.node,
  content: PropTypes.string,
  polyfill: PropTypes.string,
  state: PropTypes.string,
  locale: PropTypes.string,
  scripts: PropTypes.node,
  relayData: PropTypes.any,
  head: PropTypes.object.isRequired,
};

export default Application;
