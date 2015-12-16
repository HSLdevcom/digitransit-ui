React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
IndexNavigation    = require '../component/navigation/index-navigation.cjsx'
FrontPagePanel     = require '../component/front-page/front-page-panel.cjsx'
SearchTwoFieldsContainer = require '../component/search/search-two-fields-container'
Icon               = require '../component/icon/icon'
Link               = require 'react-router/lib/Link'
MapWithTracking    = require '../component/map/map-with-tracking'
DocumentMeta       = require 'react-document-meta'
config = require '../config'

class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  toggleFullscreenMap: =>
    @context.history.pushState null, "/kartta"

  render: ->
    configPath = config.CONFIG
    root = config.APP_PATH

    metaData =
      title: config.title + ' kikkare'
      meta:
        httpEquiv:
          'x-ua-compatible': 'ie=edge'
          'Content-Language': 'fi'
        charset: 'utf-8'
        name:
          description: 'reit-ti-o-pas'
          keywords: 'reitti,opas,reittiopas'
          viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, minimal-ui'
          'mobile-web-app-capable': 'yes'
          'apple-mobile-web-app-capable': 'yes'
      # link:
      #   rel:
      #     'apple-touch-startup-image': "#{root}/img/#{configPath}-icons/ios-splash-screen.png"
      #     'apple-touch-icon':
      #       href: "#{root}/img/#{configPath}-icons/apple-icon-57x57.png"
      #       sizes: '57x57'
      # <link rel="apple-touch-icon" sizes="60x60" href="#{root}/img/#{configPath}-icons/apple-icon-60x60.png"/>
      # <link rel="apple-touch-icon" sizes="72x72" href="#{root}/img/#{configPath}-icons/apple-icon-72x72.png"/>
      # <link rel="apple-touch-icon" sizes="76x76" href="#{root}/img/#{configPath}-icons/apple-icon-76x76.png"/>
      # <link rel="apple-touch-icon" sizes="114x114" href="#{root}/img/#{configPath}-icons/apple-icon-114x114.png"/>
      # <link rel="apple-touch-icon" sizes="120x120" href="#{root}/img/#{configPath}-icons/apple-icon-120x120.png"/>
      # <link rel="apple-touch-icon" sizes="144x144" href="#{root}/img/#{configPath}-icons/apple-icon-144x144.png"/>
      # <link rel="apple-touch-icon" sizes="152x152" href="#{root}/img/#{configPath}-icons/apple-icon-152x152.png"/>
      # <link rel="apple-touch-icon" sizes="180x180" href="#{root}/img/#{configPath}-icons/apple-icon-180x180.png"/>
      # <link rel="icon" type="image/png" sizes="192x192"  href="#{root}/img/#{configPath}-icons/android-icon-192x192.png"/>
      # <link rel="icon" type="image/png" sizes="32x32" href="#{root}/img/#{configPath}-icons/favicon-32x32.png"/>
      # <link rel="icon" type="image/png" sizes="96x96" href="#{root}/img/#{configPath}-icons/favicon-96x96.png"/>
      # <link rel="icon" type="image/png" sizes="16x16" href="#{root}/img/#{configPath}-icons/favicon-16x16.png"/>


    <IndexNavigation className="front-page fullscreen">
      <DocumentMeta {...metaData}/>
      <MapWithTracking>
        <SearchTwoFieldsContainer/>
      </MapWithTracking>
      <FrontPagePanel/>
    </IndexNavigation>

module.exports = Page
