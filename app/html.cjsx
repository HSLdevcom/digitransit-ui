React = require 'react'
config = require './config'

class Application extends React.Component
  render: ->
    <html>
    <head>
      <meta charSet="utf-8"/>
      <meta httpEquiv="x-ua-compatible" content="ie=edge"/>
      <title>{config.title}</title>
      <meta name="description" content=""/>
      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
      <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
      <link href={config.URL.FONT} rel='stylesheet' type='text/css'/>
      <style dangerouslySetInnerHTML={ __html: @props.css }/>
    </head>
    <body>
        <div style={{display: "none"}} dangerouslySetInnerHTML={ __html: @props.svgSprite }/>
        <div id="app" style={{height: "100%"}} dangerouslySetInnerHTML={ __html: @props.content } ></div>
        <script dangerouslySetInnerHTML={ __html: @props.polyfill }/>
        <script dangerouslySetInnerHTML={ __html: @props.state }/>
        <script async src={ @props.livereload + "js/bundle.js" }/>
      </body>
    </html>

module.exports = Application
