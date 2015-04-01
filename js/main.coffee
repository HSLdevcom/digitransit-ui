FastClick = require('fastclick')
require('./component/offcanvas/offcanvas')
require('./component/tabs/tabs')
require('./component/sub-navigation/sub-navigation')

React = require('react')
Dispatcher = require('./dispatcher/dispatcher.coffee')
LocationStore = require('./store/location-store.coffee')
Locate = require('./component/locate.cjsx')
React.render(React.createElement(Locate), document.getElementById('location'))

window.addEventListener 'load', () ->
  FastClick(document.body)