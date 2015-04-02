React = require('react');
IndexNavigation = require('../component/index-navigation/index-navigation.cjsx')
IndexOffcanvas = require('../component/index-offcanvas/index-offcanvas.cjsx')
Map = require('../component/map/map.cjsx')
StopTabs = require('../component/stop-tabs/stop-tabs.cjsx')

Page = React.createClass
  render: ->
    <div>
      <IndexOffcanvas/>
      <div className="slideout-wrapper">
        <main id="main" className="panel">
          <IndexNavigation/>
          <section className="content">
            <Map/>
            <StopTabs/>
          </section>
        </main>
      </div>
    </div>

module.exports = Page