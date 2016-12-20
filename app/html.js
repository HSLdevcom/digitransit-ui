import React from 'react';

const Application = (
  {
    fonts,
    svgSprite,
    css,
    content,
    polyfill,
    state,
    config,
    locale,
    scripts,
    relayData,
    head,
  },
) => (
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
      <script dangerouslySetInnerHTML={{ __html: config }} />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(relayData) }}
        type="application/json"
        id="relayData"
      />
      {scripts}
    </body>
  </html>
);

Application.propTypes = {
  fonts: React.PropTypes.string,
  svgSprite: React.PropTypes.node,
  css: React.PropTypes.node,
  content: React.PropTypes.string,
  polyfill: React.PropTypes.string,
  state: React.PropTypes.string,
  config: React.PropTypes.string,
  locale: React.PropTypes.string,
  scripts: React.PropTypes.node,
  relayData: React.PropTypes.any,
  head: React.PropTypes.object.isRequired,
};

export default Application;
