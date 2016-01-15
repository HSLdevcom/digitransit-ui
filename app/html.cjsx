React  = require 'react'
Helmet = require 'react-helmet'
config = require './config'

class Application extends React.Component
  render: ->
    head = Helmet.rewind()

    <html lang="fi">
    <head>
      {head?.title.toComponent()}
      {head?.meta.toComponent()}
      {head?.link.toComponent()}
      <style dangerouslySetInnerHTML={ __html: @props.fonts }/>
      <script dangerouslySetInnerHTML={ __html: @props.geolocationStarter }/>
      {@props.css}
    </head>
    <body>
        <div style={{visibility: "hidden"}} dangerouslySetInnerHTML={ __html: @props.svgSprite }/>
        <div id="app" style={{height: "100%"}} dangerouslySetInnerHTML={ __html: @props.content } ></div>
        <script dangerouslySetInnerHTML={ __html: @props.polyfill }/>
        <script dangerouslySetInnerHTML={ __html: @props.state }/>
        <script dangerouslySetInnerHTML={ __html: @props.config }/>
        <script dangerouslySetInnerHTML={ __html: @props.locale }/>
        {@props.scripts}
      </body>
    </html>

module.exports = Application
