import React from 'react';
import Helmet from 'react-helmet';

const Application = (
  {
    fonts,
    geolocationStarter,
    svgSprite,
    css,
    content,
    polyfill,
    state,
    config,
    locale,
    scripts,
    relayData,
  }) => {
  const head = Helmet.rewind();

  return (
    // TODO: Needs refresh in order to work
    <html lang={locale}>
      <head>
        {head !== null ? head.title.toComponent() : false}
        {head !== null ? head.meta.toComponent() : false}
        {head !== null ? head.link.toComponent() : false}
        <link rel="stylesheet" type="text/css" href={fonts} />
        <script dangerouslySetInnerHTML={{ __html: geolocationStarter }} />
        {css}
      </head>
      <body>
        <div style={{ visibility: 'hidden' }} dangerouslySetInnerHTML={{ __html: svgSprite }} />
        <div id="app" style={{ height: '100%' }} dangerouslySetInnerHTML={{ __html: content }} />
        <script dangerouslySetInnerHTML={{ __html: polyfill }} />
        <script dangerouslySetInnerHTML={{ __html: state }} />
        <script dangerouslySetInnerHTML={{ __html: config }} />
        <script dangerouslySetInnerHTML={{ __html: `window.locale="${locale}"` }} />
        <script
          dangerouslySetInnerHTML={{ __html: `window.relayData='${JSON.stringify(relayData)}'` }}
        />
        {scripts}
      </body>
    </html>
  );
};

Application.propTypes = {
  fonts: React.PropTypes.string,
  geolocationStarter: React.PropTypes.string,
  svgSprite: React.PropTypes.string,
  css: React.PropTypes.node,
  content: React.PropTypes.string,
  polyfill: React.PropTypes.string,
  state: React.PropTypes.string,
  config: React.PropTypes.string,
  locale: React.PropTypes.string,
  scripts: React.PropTypes.node,
  relayData: React.PropTypes.any,
};

export default Application;
