React              = require 'react'
IndexNavigation    = require '../component/index-navigation/index-navigation.cjsx'
IndexOffcanvas     = require '../component/index-offcanvas/index-offcanvas.cjsx'
Map                = require '../component/map/map.cjsx'
StopTabs           = require '../component/stop-cards/stop-tabs.cjsx'
SearchWithLocation = require '../component/search-with-location/search-with-location.cjsx'


Page = React.createClass
  render: ->
    <div>
      <IndexOffcanvas/>
      <div className="slideout-wrapper">
        <main id="main" className="panel">
          <IndexNavigation/>
          <section className="content">
            <Map>
              <SearchWithLocation/>
            </Map>
            <StopTabs/>
          </section>
        </main>
      </div>
    </div>

module.exports = Page