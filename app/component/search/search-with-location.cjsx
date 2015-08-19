React          = require 'react'
Icon           = require '../icon/icon.cjsx'
Search         = require './search.cjsx'
Location       = require './location.cjsx'

class SearchWithLocation extends React.Component

  render: ->
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
          <div className="row">
            <div className="small-12 columns">
              <Location/>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <Search/>
      </div>
    </div>

module.exports = SearchWithLocation
