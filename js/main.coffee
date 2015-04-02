FastClick = require('fastclick')
require('./component/offcanvas/offcanvas')
require('./component/tabs/tabs')
require('./component/sub-navigation/sub-navigation')

React = require('react')
Dispatcher = require('./dispatcher/dispatcher.coffee')
LocationStore = require('./store/location-store.coffee')
Locate = require('./component/locate.cjsx')
React.render(React.createElement(Locate), document.getElementById('location'))


StopCardList = require('./component/stop-cards/stop-card-list')
React.render(React.createElement(StopCardList), document.getElementById('stopCardList'))

window.addEventListener 'load', () ->
  FastClick(document.body)