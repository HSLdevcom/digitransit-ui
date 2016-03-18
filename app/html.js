import React from 'react';
import Helmet from 'react-helmet';

const Application = ({fonts, geolocationStarter, svgSprite, css, content, polyfill, state, config, locale, scripts}) => {
  const head = Helmet.rewind();

  return (
    // TODO: Needs refresh in order to work
    <html lang={locale}>
      <head>
        {head !== null ? head.title.toComponent() : false}
        {head !== null ? head.meta.toComponent() : false}
        {head !== null ? head.link.toComponent() : false}
        <link rel="stylesheet" type="text/css" href={fonts} />
        <script dangerouslySetInnerHTML={{__html: geolocationStarter}} />
        {css}
      </head>
      <body>
        <div style={{visibility: 'hidden'}} dangerouslySetInnerHTML={{__html: svgSprite}} />
        <div id="app" style={{height: '100%'}} dangerouslySetInnerHTML={{__html: content}} />
        <script dangerouslySetInnerHTML={{__html: polyfill}} />
        <script dangerouslySetInnerHTML={{__html: state}} />
        <script dangerouslySetInnerHTML={{__html: config}} />
        <script dangerouslySetInnerHTML={{__html: `window.locale="${ locale }"`}} />
        {scripts}
      </body>
    </html>
  );
};

export default Application;
