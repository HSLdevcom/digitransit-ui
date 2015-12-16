React = require 'react'
config = require './config'

class Application extends React.Component
  render: ->
    configPath = config.CONFIG
    root = config.APP_PATH

    <html lang="fi">
    <head>
      <title>{config.title}</title>
      <style dangerouslySetInnerHTML={ __html: @props.fonts }/>
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
